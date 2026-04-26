import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
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

// Loud warning when production is running on local-dev defaults — the cause
// of the "NoSuchBucket" silent failure we just hit. Logged once at boot.
if (process.env.NODE_ENV === 'production') {
  const issues: string[] = [];
  if (!process.env.STORAGE_BUCKET) issues.push("STORAGE_BUCKET unset (defaulting to 'legacyshield' — wrong for prod)");
  if (!process.env.STORAGE_ENDPOINT) issues.push("STORAGE_ENDPOINT unset (defaulting to localhost:9000)");
  if (!process.env.STORAGE_ACCESS_KEY) issues.push("STORAGE_ACCESS_KEY unset (defaulting to MinIO devkey)");
  if (!process.env.STORAGE_SECRET_KEY) issues.push("STORAGE_SECRET_KEY unset (defaulting to MinIO devkey)");
  if (issues.length) {
    logger.error('STORAGE CONFIG MISSING in production:', { issues, effective: { bucket: STORAGE_BUCKET, endpoint: STORAGE_ENDPOINT, region: STORAGE_REGION } });
  }
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

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }));
    return { bucket: STORAGE_BUCKET, endpointHost, region: STORAGE_REGION, reachable: true, hasCredentials };
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
    };
  }
}
