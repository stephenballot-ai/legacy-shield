/**
 * Standard error codes used across the application
 */

export type ErrorCode =
  // Auth
  | 'INVALID_CREDENTIALS'
  | 'TWO_FACTOR_REQUIRED'
  | 'INVALID_TWO_FACTOR_CODE'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED'
  // Validation
  | 'VALIDATION_ERROR'
  | 'INVALID_EMAIL'
  | 'PASSWORD_TOO_WEAK'
  // Resources
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  // Limits
  | 'DOCUMENT_LIMIT_REACHED'
  | 'FILE_TOO_LARGE'
  | 'EMERGENCY_CONTACT_LIMIT_REACHED'
  // Permissions
  | 'READ_ONLY_SESSION'
  | 'INSUFFICIENT_PERMISSIONS'
  // Server
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface APIError {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: Record<string, any>;
}
