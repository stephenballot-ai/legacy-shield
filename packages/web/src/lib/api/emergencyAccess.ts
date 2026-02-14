/**
 * Emergency Access API functions
 */

import { api } from './client';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  lastAccessedAt: string | null;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SetupEmergencyAccessParams {
  emergencyPhraseHash: string;
  emergencyKeyEncrypted: string;
  emergencyKeySalt: string;
}

interface ValidateEmergencyPhraseResponse {
  accessToken: string;
  userId: string;
  emergencyKeyEncrypted: string;
  emergencyKeySalt: string;
}

interface RotateEmergencyKeyParams {
  newPhraseHash: string;
  newKeyEncrypted: string;
  newKeySalt: string;
}

interface EmergencyAccessStatus {
  isSetUp: boolean;
  contactCount: number;
  setupAt: string | null;
}

export const emergencyAccessApi = {
  getStatus: () =>
    api.get<EmergencyAccessStatus>('/emergency-access/status'),

  setupEmergencyAccess: (params: SetupEmergencyAccessParams) =>
    api.post<{ success: boolean }>('/emergency-access/setup', params),

  validateEmergencyPhrase: (emergencyPhraseHash: string) =>
    api.post<ValidateEmergencyPhraseResponse>('/emergency-access/validate', { emergencyPhraseHash }),

  rotateEmergencyKey: (params: RotateEmergencyKeyParams) =>
    api.post<{ success: boolean }>('/emergency-access/rotate-key', params),

  listContacts: () =>
    api.get<{ contacts: EmergencyContact[] }>('/emergency-access/contacts'),

  addContact: (data: { name: string; relationship: string; email?: string; phone?: string; notes?: string }) =>
    api.post<EmergencyContact>('/emergency-access/contacts', data),

  updateContact: (id: string, data: Partial<{ name: string; relationship: string; email: string; phone: string; notes: string }>) =>
    api.patch<EmergencyContact>(`/emergency-access/contacts/${id}`, data),

  deleteContact: (id: string) =>
    api.delete<{ success: boolean }>(`/emergency-access/contacts/${id}`),
};
