import { z } from 'zod';

const fileCategoryEnum = z.enum([
  'IDENTITY', 'PROPERTY', 'FINANCIAL', 'INSURANCE', 'MEDICAL',
  'LEGAL', 'TAX', 'TRAVEL', 'FAMILY', 'DIGITAL_ASSETS', 'OTHER',
]);

export const uploadFileSchema = z.object({
  filename: z.string().min(1).max(255),
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
  category: fileCategoryEnum.nullish(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isFavorite: z.boolean().optional(),
  isEmergencyPriority: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
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
