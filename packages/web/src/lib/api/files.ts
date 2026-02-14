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

  uploadToPresignedUrl: async (url: string, encryptedBlob: Blob): Promise<void> => {
    const res = await fetch(url, {
      method: 'PUT',
      body: encryptedBlob,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (!res.ok) throw new Error('Failed to upload file to storage');
  },

  getFile: (id: string) =>
    api.get<GetFileResponse>(`/files/${id}`),

  downloadFromPresignedUrl: async (url: string): Promise<Blob> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to download file');
    return res.blob();
  },

  updateFile: (id: string, updates: UpdateFileParams) =>
    api.patch<LSFile>(`/files/${id}`, updates),

  deleteFile: (id: string, hard?: boolean) =>
    api.delete<{ success: boolean }>(`/files/${id}${hard ? '?hard=true' : ''}`),
};
