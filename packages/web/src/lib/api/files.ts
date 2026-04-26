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
  referralTriggered?: boolean;
  referralCode?: string;
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
    // If fileId provided, use proxy endpoint with bearer auth + refresh-on-401.
    if (fileId) {
      const { getAccessToken, refreshToken } = await import('./client');
      const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const blobUrl = `${API_ROOT}/api/v1/files/${fileId}/blob`;

      const fetchWith = async (token: string | null) => {
        const headers: Record<string, string> = { 'Content-Type': 'application/octet-stream' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(blobUrl, { method: 'PUT', body: encryptedBlob, credentials: 'include', headers });
      };

      let token = getAccessToken();
      if (!token) token = await refreshToken();

      let res = await fetchWith(token);
      if (res.status === 401) {
        const fresh = await refreshToken();
        if (fresh) res = await fetchWith(fresh);
      }

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(
          `Upload failed (${res.status}${res.statusText ? ' ' + res.statusText : ''})${
            detail ? ': ' + detail.slice(0, 200) : ''
          }`
        );
      }
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
    // If fileId provided, use proxy endpoint with bearer auth + refresh-on-401.
    // The API's authenticate middleware accepts Bearer only (not cookies), so a
    // stale in-memory token must be refreshed before/around the fetch.
    if (fileId) {
      const { getAccessToken, refreshToken } = await import('./client');
      const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const blobUrl = `${API_ROOT}/api/v1/files/${fileId}/blob`;

      const fetchWith = async (token: string | null) => {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(blobUrl, { credentials: 'include', headers });
      };

      // Make sure we have a token; refresh if missing.
      let token = getAccessToken();
      if (!token) token = await refreshToken();

      let res = await fetchWith(token);
      if (res.status === 401) {
        // Stale token — try one refresh and retry.
        const fresh = await refreshToken();
        if (fresh) res = await fetchWith(fresh);
      }

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(
          `Download failed (${res.status}${res.statusText ? ' ' + res.statusText : ''})${
            detail ? ': ' + detail.slice(0, 200) : ''
          }`
        );
      }
      const blob = await res.blob();
      // Force application/octet-stream to prevent browser auto-execution.
      return new Blob([blob], { type: 'application/octet-stream' });
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Download failed (${res.status}${res.statusText ? ' ' + res.statusText : ''})`);
    }
    const blob = await res.blob();
    return new Blob([blob], { type: 'application/octet-stream' });
  },

  updateFile: (id: string, updates: UpdateFileParams) =>
    api.patch<LSFile>(`/files/${id}`, updates),

  deleteFile: (id: string, hard?: boolean) =>
    api.delete<{ success: boolean }>(`/files/${id}${hard ? '?hard=true' : ''}`),
};
