import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ============================================================================
// S3 CLIENT (MinIO locally / Hetzner Object Storage in prod)
// ============================================================================

const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || 'http://localhost:9000';
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'legacyshield';
const STORAGE_REGION = process.env.STORAGE_REGION || 'eu-central-1';
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || 'minioadmin';
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY || 'minioadmin';

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
 * Upload a buffer directly to S3.
 */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);
}

/**
 * Download an object from S3 as a buffer.
 */
export async function downloadObject(key: string): Promise<{ body: Buffer; contentType?: string }> {
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  });
  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return {
    body: Buffer.concat(chunks),
    contentType: response.ContentType,
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
