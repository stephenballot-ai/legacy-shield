import { Router, Request, Response } from 'express';
import { authenticate, requireOwner } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadFileSchema, updateFileSchema, listFilesQuerySchema } from './files.validation';
import {
  uploadFile,
  listFiles,
  getFile,
  updateFile,
  deleteFile,
  TierLimitError,
} from '../services/file';
import { uploadObject, downloadObject, getStorageKey } from '../lib/s3';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// GET /files — List files (OWNER + EMERGENCY_CONTACT)
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const queryResult = listFilesQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: queryResult.error.errors[0].message,
        },
      });
      return;
    }

    const result = await listFiles({
      userId: req.user!.userId,
      ...queryResult.data,
      // Emergency contacts see all files (they've validated the unlock phrase)
    });

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list files' },
    });
  }
});

// ============================================================================
// POST /files/upload — Create file record + presigned URL (OWNER only)
// ============================================================================
router.post('/upload', requireOwner, validate(uploadFileSchema), async (req: Request, res: Response) => {
  try {
    const result = await uploadFile({
      userId: req.user!.userId,
      tier: req.user!.tier,
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Return shape the frontend expects: { fileId, uploadUrl }
    res.status(201).json({
      fileId: result.file.id,
      uploadUrl: result.uploadUrl,
      ...(result.referralTriggered ? { referralTriggered: true, referralCode: result.referralCode } : {}),
    });
  } catch (err) {
    if (err instanceof TierLimitError) {
      res.status(403).json({
        error: { code: err.code, message: err.message },
      });
      return;
    }
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Upload failed' },
    });
  }
});

// ============================================================================
// PUT /files/:id/blob — Proxy upload encrypted blob to S3 (OWNER only)
// ============================================================================
router.put('/:id/blob', requireOwner, async (req: Request, res: Response) => {
  try {
    // Verify file belongs to user
    const file = await getFile(req.params.id, req.user!.userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionType: req.user!.sessionType,
    });
    if (!file) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' } });
      return;
    }

    // Collect raw body
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks);
        const storageKey = getStorageKey(req.user!.userId, req.params.id);
        await uploadObject(storageKey, body, 'application/octet-stream');
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to upload blob' } });
      }
    });
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Upload failed' } });
  }
});

// ============================================================================
// GET /files/:id/blob — Proxy download encrypted blob from S3
// ============================================================================
router.get('/:id/blob', async (req: Request, res: Response) => {
  try {
    const file = await getFile(req.params.id, req.user!.userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionType: req.user!.sessionType,
    });
    if (!file) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' } });
      return;
    }

    const storageKey = getStorageKey(req.user!.userId, req.params.id);
    const { body, contentType } = await downloadObject(storageKey);
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Length', body.length);
    res.send(body);
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Download failed' } });
  }
});

// ============================================================================
// GET /files/:id — Get file details + download URL (OWNER + EMERGENCY_CONTACT)
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await getFile(req.params.id, req.user!.userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionType: req.user!.sessionType,
    });

    if (!result) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get file' },
    });
  }
});

// ============================================================================
// PATCH /files/:id — Update file metadata (OWNER only)
// ============================================================================
router.patch('/:id', requireOwner, validate(updateFileSchema), async (req: Request, res: Response) => {
  try {
    // Transform expiresAt string to Date if present
    const data = { ...req.body };
    if (data.expiresAt !== undefined && data.expiresAt !== null) {
      data.expiresAt = new Date(data.expiresAt);
    }

    const result = await updateFile(req.params.id, req.user!.userId, data, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (!result) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update file' },
    });
  }
});

// ============================================================================
// PATCH /files/:id/emergency-key — Update file's emergency-encrypted key (OWNER only)
// ============================================================================
router.patch('/:id/emergency-key', requireOwner, async (req: Request, res: Response) => {
  try {
    const { emergencyEncryptedKey, emergencyIV } = req.body as { emergencyEncryptedKey: string; emergencyIV: string };
    if (!emergencyEncryptedKey || !emergencyIV) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'emergencyEncryptedKey and emergencyIV are required' },
      });
      return;
    }

    const { prisma } = await import('../lib/prisma');
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user!.userId, deletedAt: null },
    });

    if (!file) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' } });
      return;
    }

    await prisma.file.update({
      where: { id: req.params.id },
      data: { emergencyEncryptedKey, emergencyIV },
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update emergency key' },
    });
  }
});

// ============================================================================
// DELETE /files/:id — Soft delete file (OWNER only)
// ============================================================================
router.delete('/:id', requireOwner, async (req: Request, res: Response) => {
  try {
    const hard = req.query.hard === 'true';
    const result = await deleteFile(req.params.id, req.user!.userId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      hard,
    });

    if (!result) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete file' },
    });
  }
});

export default router;
