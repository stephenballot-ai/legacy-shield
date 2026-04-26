import { z } from 'zod';

const fileCategoryEnum = z.enum([
  'IDENTITY', 'PROPERTY', 'FINANCIAL', 'INSURANCE', 'MEDICAL',
  'LEGAL', 'TAX', 'TRAVEL', 'FAMILY', 'DIGITAL_ASSETS', 'OTHER',
]);

// Sanitize filenames: strip HTML tags and control characters
const safeFilename = z.string().min(1).max(255)
  // eslint-disable-next-line no-control-regex -- intentionally stripping C0 control chars from filenames
  .transform((v) => v.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f]/g, '').trim())
  .pipe(z.string().min(1, 'Filename cannot be empty after sanitization'));

export const uploadFileSchema = z.object({
  filename: safeFilename,
  mimeType: z.string().min(1).max(127),
  fileSizeBytes: z.number().int().positive(),
  category: fileCategoryEnum.nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isEmergencyPriority: z.boolean().optional(),
  ownerEncryptedKey: z.string().min(1),
  ownerIV: z.string().min(1),
  emergencyEncryptedKey: z.string().nullable().optional(),
  emergencyIV: z.string().nullable().optional(),
  iv: z.string().min(1),
  authTag: z.string().min(1),
});

export const updateFileSchema = z.object({
  filename: safeFilename.optional(),
  category: fileCategoryEnum.nullish(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isFavorite: z.boolean().optional(),
  isEmergencyPriority: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
  emergencyEncryptedKey: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const listFilesQuerySchema = z.object({
  category: fileCategoryEnum.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  favorites: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)).pipe(z.number().int().min(1).max(100)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)).pipe(z.number().int().min(0)),
});
