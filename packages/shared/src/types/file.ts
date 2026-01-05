/**
 * File/Document-related types
 */

export type FileCategory =
  | 'IDENTITY'
  | 'PROPERTY'
  | 'FINANCIAL'
  | 'INSURANCE'
  | 'MEDICAL'
  | 'LEGAL'
  | 'TAX'
  | 'TRAVEL'
  | 'FAMILY'
  | 'DIGITAL_ASSETS'
  | 'OTHER';

export interface File {
  id: string;
  userId: string;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  category: FileCategory | null;
  tags: string[];
  isFavorite: boolean;
  isEmergencyPriority: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EncryptedFileMetadata {
  ownerEncryptedKey: string;
  emergencyEncryptedKey: string | null;
  iv: string;
  authTag: string;
}
