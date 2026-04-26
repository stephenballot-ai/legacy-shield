import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Transform } from 'stream';
import { logger } from '../utils/logger';

// ============================================================================
// S3 CLIENT (MinIO locally / Hetzner Object Storage in prod)
// ============================================================================

const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || 'http://localhost:9000';
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'legacyshield';
const STORAGE_REGION = process.env.STORAGE_REGION || 'eu-central-1';
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || 'minioadmin';
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY || 'minioadmin';

/**
 * Hard pre-flight check called at boot. In production, refuses to start the
 * server unless every STORAGE_* env var is explicitly set AND HeadBucket
 * succeeds against the configured bucket. Retries 3× with exponential backoff
 * to forgive a brief storage-network hiccup at deploy time, then exits 1
 * (PM2 / docker will surface the crashloop instead of pretending healthy).
 *
 * Local dev (NODE_ENV !== 'production') is permissive — MinIO defaults stay
 * usable for `docker compose up`.
 */
export async function verifyStorageOrExit(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;

  const required = ['STORAGE_BUCKET', 'STORAGE_ENDPOINT', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    logger.error('STORAGE CONFIG MISSING — refusing to start.', { missing });
    process.exit(1);
  }

  // Reject the local-dev fallbacks even when something is set — they're
  // unmistakably wrong for production.
  const looksLikeDev =
    process.env.STORAGE_ACCESS_KEY === 'minioadmin' &&
    process.env.STORAGE_SECRET_KEY === 'minioadmin' &&
    /localhost|127\.0\.0\.1/.test(process.env.STORAGE_ENDPOINT || '');
  if (looksLikeDev) {
    logger.error('STORAGE CONFIG looks like local-dev defaults in production — refusing to start.', {
      endpoint: STORAGE_ENDPOINT,
    });
    process.exit(1);
  }

  // Verify the bucket actually exists, with retries.
  const delays = [0, 1000, 2000];
  let lastError: string | undefined;
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }));
      logger.info('Storage pre-flight OK', { bucket: STORAGE_BUCKET, endpoint: STORAGE_ENDPOINT });
      return;
    } catch (err) {
      const e = err as { name?: string; Code?: string };
      lastError = e.name || e.Code || 'Unknown';
    }
  }

  logger.error('STORAGE PRE-FLIGHT FAILED — refusing to start.', {
    bucket: STORAGE_BUCKET,
    endpoint: STORAGE_ENDPOINT,
    region: STORAGE_REGION,
    error: lastError,
  });
  process.exit(1);
}

export const s3Client = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  region: STORAGE_REGION,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export function getBucket(): string {
  return STORAGE_BUCKET;
}

/**
 * Storage key format: users/{userId}/files/{fileId}.encrypted
 */
export function getStorageKey(userId: string, fileId: string): string {
  return `users/${userId}/files/${fileId}.encrypted`;
}

/**
 * Generate a presigned URL for uploading a file (15 min expiry).
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 15 * 60 });
}

/**
 * Generate a presigned URL for downloading a file (1 hour expiry).
 */
export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
}

/**
 * Upload a stream directly to S3 while enforcing a hard max byte limit.
 */
export async function uploadObjectStream(
  key: string,
  body: NodeJS.ReadableStream,
  contentType: string,
  maxBytes: number,
  contentLength?: number
): Promise<void> {
  let uploadedBytes = 0;

  const byteLimitTransform = new Transform({
    transform(chunk, _encoding, callback) {
      uploadedBytes += Buffer.byteLength(chunk);
      if (uploadedBytes > maxBytes) {
        callback(new Error('FILE_SIZE_LIMIT_EXCEEDED'));
        return;
      }
      callback(null, chunk);
    },
  });

  body.pipe(byteLimitTransform);

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    Body: byteLimitTransform,
    ContentType: contentType,
    ...(contentLength ? { ContentLength: contentLength } : {}),
  });
  await s3Client.send(command);
}

/**
 * Download an object from S3 as a stream.
 */
export async function downloadObjectStream(
  key: string
): Promise<{ body: NodeJS.ReadableStream; contentType?: string; contentLength?: number }> {
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  });
  const response = await s3Client.send(command);
  return {
    body: response.Body as NodeJS.ReadableStream,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}

/**
 * Delete an object from S3.
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Probe storage reachability (HeadBucket). Returns config + a boolean +
 * any AWS-SDK error name. Used by GET /api/v1/health/storage so we can
 * diagnose without going inside the container.
 *
 * Bucket name and endpoint host are NOT secrets — they're inferable from
 * the architecture spec — so it's safe to expose. Credentials are never
 * returned.
 */
export async function probeStorage(): Promise<{
  bucket: string;
  endpointHost: string;
  region: string;
  reachable: boolean;
  error?: string;
  status?: number;
  hasCredentials: boolean;
  availableBuckets?: Array<{ name: string; objectCount: number }>;
  listError?: string;
}> {
  const endpointHost = (() => {
    try {
      return new URL(STORAGE_ENDPOINT).host;
    } catch {
      return STORAGE_ENDPOINT;
    }
  })();
  const hasCredentials =
    !!process.env.STORAGE_ACCESS_KEY && !!process.env.STORAGE_SECRET_KEY;

  // Always try ListBuckets so we can show what bucket names actually exist on
  // this storage backend — much faster diagnostic than guessing names.
  let availableBuckets: Array<{ name: string; objectCount: number }> | undefined;
  let listError: string | undefined;
  try {
    const list = await s3Client.send(new ListBucketsCommand({}));
    const names = (list.Buckets || []).map((b) => b.Name).filter((n): n is string => !!n);
    // For each bucket, do a tiny ListObjectsV2 (max-keys=1) to get a hint of
    // whether files are present. Cheap; bounded by bucket count.
    availableBuckets = await Promise.all(
      names.map(async (name) => {
        try {
          const objs = await s3Client.send(
            new ListObjectsV2Command({ Bucket: name, MaxKeys: 1 })
          );
          return { name, objectCount: objs.KeyCount ?? 0 };
        } catch {
          return { name, objectCount: -1 };
        }
      })
    );
  } catch (err) {
    const e = err as { name?: string; Code?: string };
    listError = e.name || e.Code || 'Unknown';
  }

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }));
    return {
      bucket: STORAGE_BUCKET,
      endpointHost,
      region: STORAGE_REGION,
      reachable: true,
      hasCredentials,
      availableBuckets,
      listError,
    };
  } catch (err) {
    const e = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number }; message?: string };
    return {
      bucket: STORAGE_BUCKET,
      endpointHost,
      region: STORAGE_REGION,
      reachable: false,
      error: e.name || e.Code || 'Unknown',
      status: e.$metadata?.httpStatusCode,
      hasCredentials,
      availableBuckets,
      listError,
    };
  }
}

/**
 * Deep audit of every bucket reachable from the API's MinIO. Returns:
 *  - For each bucket: total object count (paginated, capped 10k), distinct
 *    user prefixes (first segment after `users/`), and a sample of keys with
 *    UUIDs masked.
 *
 * The point of this is recovery diagnostics: cross-reference these counts
 * with the DB's File row count to find blob/metadata gaps from the
 * BitAtlas spin-off bucket-rename incident.
 */
export async function auditStorage(): Promise<{
  bucket: string;
  endpointHost: string;
  buckets: Array<{
    name: string;
    objectCount: number;
    truncated: boolean;
    distinctUserPrefixes: number;
    sampleKeys: string[];
    error?: string;
  }>;
}> {
  const endpointHost = (() => {
    try {
      return new URL(STORAGE_ENDPOINT).host;
    } catch {
      return STORAGE_ENDPOINT;
    }
  })();
  const list = await s3Client.send(new ListBucketsCommand({}));
  const names = (list.Buckets || []).map((b) => b.Name).filter((n): n is string => !!n);

  const buckets = await Promise.all(
    names.map(async (name) => {
      try {
        let token: string | undefined;
        let total = 0;
        const userPrefixes = new Set<string>();
        const sample: string[] = [];
        const HARD_CAP = 10_000;
        let truncated = false;
        do {
          const resp = await s3Client.send(
            new ListObjectsV2Command({
              Bucket: name,
              MaxKeys: 1000,
              ContinuationToken: token,
            })
          );
          for (const obj of resp.Contents || []) {
            if (!obj.Key) continue;
            total++;
            // users/<userId>/files/<fileId>.encrypted
            const m = obj.Key.match(/^users\/([^/]+)\//);
            if (m) userPrefixes.add(m[1]);
            if (sample.length < 5) {
              // Mask UUIDs so logs don't leak file IDs verbatim.
              const masked = obj.Key.replace(
                /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
                '<uuid>'
              );
              sample.push(masked);
            }
            if (total >= HARD_CAP) {
              truncated = true;
              break;
            }
          }
          token = resp.NextContinuationToken;
          if (total >= HARD_CAP) break;
        } while (token);

        return {
          name,
          objectCount: total,
          truncated,
          distinctUserPrefixes: userPrefixes.size,
          sampleKeys: sample,
        };
      } catch (err) {
        const e = err as { name?: string; Code?: string };
        return {
          name,
          objectCount: -1,
          truncated: false,
          distinctUserPrefixes: 0,
          sampleKeys: [],
          error: e.name || e.Code || 'Unknown',
        };
      }
    })
  );

  return {
    bucket: STORAGE_BUCKET,
    endpointHost,
    buckets,
  };
}
