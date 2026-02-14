import { prisma } from '../lib/prisma';
import {
  getStorageKey,
  getBucket,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteObject,
} from '../lib/s3';
import { logAudit } from './auth';
// Tier limits (mirrored from @legacy-shield/shared)
const DOCUMENT_LIMITS = { FREE_TIER: 15, PRO_TIER: 100 } as const;
const FILE_SIZE_LIMITS = { FREE_TIER: 5 * 1024 * 1024, PRO_TIER: 10 * 1024 * 1024 } as const;
import type { FileCategory } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

interface UploadFileParams {
  userId: string;
  tier: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  category?: FileCategory | null;
  tags?: string[];
  isEmergencyPriority?: boolean;
  ownerEncryptedKey: string;
  ownerIV: string;
  emergencyEncryptedKey?: string | null;
  emergencyIV?: string | null;
  iv: string;
  authTag: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ListFilesParams {
  userId: string;
  category?: FileCategory;
  tag?: string;
  search?: string;
  favorites?: boolean;
  limit?: number;
  offset?: number;
}

interface UpdateFileParams {
  category?: FileCategory | null;
  tags?: string[];
  isFavorite?: boolean;
  isEmergencyPriority?: boolean;
  expiresAt?: Date | null;
  emergencyEncryptedKey?: string;
}

// ============================================================================
// FILE STATS
// ============================================================================

export async function getFileStats(userId: string): Promise<{ count: number }> {
  const count = await prisma.file.count({
    where: { userId, deletedAt: null },
  });
  return { count };
}

// ============================================================================
// UPLOAD FILE
// ============================================================================

export async function uploadFile(params: UploadFileParams) {
  const {
    userId, tier, filename, mimeType, fileSizeBytes,
    category, tags, ownerEncryptedKey, ownerIV, emergencyEncryptedKey, emergencyIV,
    iv, authTag, ipAddress, userAgent,
  } = params;

  // Enforce tier limits - document count
  const maxDocs = tier === 'PRO' ? DOCUMENT_LIMITS.PRO_TIER : DOCUMENT_LIMITS.FREE_TIER;
  const { count } = await getFileStats(userId);
  if (count >= maxDocs) {
    throw new TierLimitError(
      `Document limit reached (${maxDocs}). Upgrade to store more files.`,
      'DOCUMENT_LIMIT_REACHED'
    );
  }

  // Enforce tier limits - file size
  const maxSize = tier === 'PRO' ? FILE_SIZE_LIMITS.PRO_TIER : FILE_SIZE_LIMITS.FREE_TIER;
  if (fileSizeBytes > maxSize) {
    throw new TierLimitError(
      `File exceeds size limit (${Math.round(maxSize / 1024 / 1024)}MB). Upgrade for larger files.`,
      'FILE_SIZE_LIMIT_EXCEEDED'
    );
  }

  // Create DB record
  const file = await prisma.file.create({
    data: {
      userId,
      filename,
      mimeType,
      fileSizeBytes,
      storageKey: '', // will update after generating key
      storageBucket: getBucket(),
      ownerEncryptedKey,
      ownerIV: ownerIV ?? null,
      emergencyEncryptedKey: emergencyEncryptedKey ?? null,
      emergencyIV: emergencyIV ?? null,
      iv,
      authTag,
      category: category ?? null,
      tags: tags ?? [],
    },
  });

  // Set storage key using file ID
  const storageKey = getStorageKey(userId, file.id);
  await prisma.file.update({
    where: { id: file.id },
    data: { storageKey },
  });

  // Generate presigned upload URL
  const uploadUrl = await generatePresignedUploadUrl(storageKey, mimeType);

  // Audit log
  await logAudit({
    userId,
    action: 'FILE_UPLOAD',
    resourceType: 'file',
    resourceId: file.id,
    ipAddress,
    userAgent,
    metadata: { filename, mimeType, fileSizeBytes, category },
  });

  return {
    file: {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      fileSizeBytes: file.fileSizeBytes,
      category: file.category,
      tags: file.tags,
      createdAt: file.createdAt,
    },
    uploadUrl,
    storageKey,
  };
}

// ============================================================================
// LIST FILES
// ============================================================================

export async function listFiles(params: ListFilesParams) {
  const { userId, category, tag, search, favorites, limit = 50, offset = 0 } = params;

  const where: Record<string, unknown> = {
    userId,
    deletedAt: null,
  };

  if (category) where.category = category;
  if (tag) where.tags = { has: tag };
  if (favorites) where.isFavorite = true;
  if (search) where.filename = { contains: search, mode: 'insensitive' };

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      select: {
        id: true,
        filename: true,
        fileSizeBytes: true,
        mimeType: true,
        category: true,
        tags: true,
        isFavorite: true,
        isEmergencyPriority: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
    }),
    prisma.file.count({ where }),
  ]);

  return { files, total, limit, offset };
}

// ============================================================================
// GET FILE
// ============================================================================

export async function getFile(
  fileId: string,
  userId: string,
  context: { ipAddress?: string; userAgent?: string; sessionType: string }
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, deletedAt: null },
  });

  if (!file) return null;

  const downloadUrl = await generatePresignedDownloadUrl(file.storageKey);

  // Audit - VIEW
  await logAudit({
    userId,
    action: 'FILE_VIEW',
    resourceType: 'file',
    resourceId: file.id,
    sessionType: context.sessionType as 'OWNER' | 'EMERGENCY_CONTACT',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return {
    file: {
      id: file.id,
      filename: file.filename,
      fileSizeBytes: file.fileSizeBytes,
      mimeType: file.mimeType,
      category: file.category,
      tags: file.tags,
      isFavorite: file.isFavorite,
      isEmergencyPriority: file.isEmergencyPriority,
      expiresAt: file.expiresAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    },
    downloadUrl,
    ownerEncryptedKey: file.ownerEncryptedKey,
    ownerIV: file.ownerIV,
    emergencyEncryptedKey: file.emergencyEncryptedKey,
    emergencyIV: file.emergencyIV,
    iv: file.iv,
    authTag: file.authTag,
  };
}

// ============================================================================
// UPDATE FILE
// ============================================================================

export async function updateFile(
  fileId: string,
  userId: string,
  data: UpdateFileParams,
  context: { ipAddress?: string; userAgent?: string }
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, deletedAt: null },
  });

  if (!file) return null;

  const updated = await prisma.file.update({
    where: { id: fileId },
    data,
    select: {
      id: true,
      filename: true,
      fileSizeBytes: true,
      mimeType: true,
      category: true,
      tags: true,
      isFavorite: true,
      isEmergencyPriority: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logAudit({
    userId,
    action: 'FILE_UPDATE',
    resourceType: 'file',
    resourceId: fileId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { updatedFields: Object.keys(data) },
  });

  return updated;
}

// ============================================================================
// DELETE FILE (soft delete, optional hard delete)
// ============================================================================

export async function deleteFile(
  fileId: string,
  userId: string,
  context: { ipAddress?: string; userAgent?: string; hard?: boolean }
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, deletedAt: null },
  });

  if (!file) return null;

  if (context.hard) {
    // Hard delete: remove from S3 and DB
    await deleteObject(file.storageKey);
    await prisma.file.delete({ where: { id: fileId } });
  } else {
    // Soft delete
    await prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });
  }

  await logAudit({
    userId,
    action: 'FILE_DELETE',
    resourceType: 'file',
    resourceId: fileId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { hard: !!context.hard, filename: file.filename },
  });

  return { id: fileId, deleted: true };
}

// ============================================================================
// CUSTOM ERROR
// ============================================================================

export class TierLimitError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'TierLimitError';
  }
}
