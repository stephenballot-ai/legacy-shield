/**
 * Files API functions
 */

import type { File as LSFile, FileCategory } from '@legacy-shield/shared';
import { api } from './client';

interface ListFilesParams {
  category?: FileCategory;
  tag?: string;
  search?: string;
  favorites?: boolean;
  limit?: number;
  offset?: number;
}

interface ListFilesResponse {
  files: LSFile[];
  total: number;
  limit: number;
  offset: number;
}

interface UploadFileParams {
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  category?: FileCategory | null;
  tags?: string[];
  isEmergencyPriority?: boolean;
  ownerEncryptedKey: string;
  emergencyEncryptedKey?: string | null;
  ownerIV: string;
  emergencyIV?: string | null;
  iv: string;
  authTag: string;
}

interface UploadFileResponse {
  fileId: string;
  uploadUrl: string;
}

interface GetFileResponse {
  file: LSFile;
  downloadUrl: string;
  ownerEncryptedKey: string;
  ownerIV: string;
  emergencyEncryptedKey: string | null;
  emergencyIV: string | null;
  iv: string;
  authTag: string;
}

interface UpdateFileParams {
  filename?: string;
  category?: FileCategory | null;
  tags?: string[];
  isFavorite?: boolean;
  isEmergencyPriority?: boolean;
  expiresAt?: string | null;
}

export const filesApi = {
  listFiles: (params: ListFilesParams = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    if (params.favorites) query.set('favorites', 'true');
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return api.get<ListFilesResponse>(`/files${qs ? `?${qs}` : ''}`);
  },

  uploadFile: (metadata: UploadFileParams) =>
    api.post<UploadFileResponse>('/files/upload', metadata),

  uploadToPresignedUrl: async (url: string, encryptedBlob: Blob, fileId?: string): Promise<void> => {
    // If fileId provided, use proxy endpoint instead of presigned URL
    if (fileId) {
      const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_ROOT}/api/v1/files/${fileId}/blob`, {
        method: 'PUT',
        body: encryptedBlob,
        credentials: 'include',
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      if (!res.ok) throw new Error('Failed to upload file to storage');
      return;
    }
    const res = await fetch(url, {
      method: 'PUT',
      body: encryptedBlob,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (!res.ok) throw new Error('Failed to upload file to storage');
  },

  getFile: (id: string) =>
    api.get<GetFileResponse>(`/files/${id}`),

  downloadFromPresignedUrl: async (url: string, fileId?: string): Promise<Blob> => {
    // If fileId provided, use proxy endpoint
    if (fileId) {
      const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_ROOT}/api/v1/files/${fileId}/blob`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download file');
      return res.blob();
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to download file');
    return res.blob();
  },

  updateFile: (id: string, updates: UpdateFileParams) =>
    api.patch<LSFile>(`/files/${id}`, updates),

  deleteFile: (id: string, hard?: boolean) =>
    api.delete<{ success: boolean }>(`/files/${id}${hard ? '?hard=true' : ''}`),
};
