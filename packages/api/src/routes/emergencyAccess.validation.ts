import { z } from 'zod';

export const setupEmergencyAccessSchema = z.object({
  emergencyPhraseHash: z.string().min(1, 'Emergency phrase hash is required'),
  emergencyKeyEncrypted: z.string().min(1, 'Emergency key is required'),
  emergencyKeySalt: z.string().min(1, 'Emergency key salt is required'),
});

export const validateEmergencyPhraseSchema = z.object({
  emergencyPhraseHash: z.string().min(1, 'Emergency phrase hash is required'),
});

export const rotateEmergencyKeySchema = z.object({
  newEmergencyPhraseHash: z.string().min(1, 'New emergency phrase hash is required'),
  newEmergencyKeyEncrypted: z.string().min(1, 'New emergency key is required'),
  newEmergencyKeySalt: z.string().min(1, 'New emergency key salt is required'),
});

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  relationship: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});
