'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmergencyContactForm } from './EmergencyContactForm';
import { emergencyAccessApi, type EmergencyContact } from '@/lib/api/emergencyAccess';
import { formatDate } from '@/lib/utils';
import { UserPlus, Pencil, Trash2, Mail, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyContactsListProps {
  maxContacts?: number;
  onContactsChange?: () => void;
}

export function EmergencyContactsList({ maxContacts = 5, onContactsChange }: EmergencyContactsListProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await emergencyAccessApi.listContacts();
      setContacts(res.contacts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleAdd = async (data: { name: string; relationship: string; email?: string; phone?: string; notes?: string }) => {
    setSaving(true);
    try {
      await emergencyAccessApi.addContact(data);
      setShowAddForm(false);
      await fetchContacts();
      onContactsChange?.();
      toast.success('Contact added', {
        description: "Don't forget to share your unlock phrase with them securely.",
        duration: 6000,
      });
    } catch (err) {
      toast.error('Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: { name: string; relationship: string; email?: string; phone?: string; notes?: string }) => {
    setSaving(true);
    try {
      await emergencyAccessApi.updateContact(id, data);
      setEditingId(null);
      await fetchContacts();
      onContactsChange?.();
      toast.success('Contact updated');
    } catch (err) {
      toast.error('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await emergencyAccessApi.deleteContact(id);
      setDeletingId(null);
      await fetchContacts();
      onContactsChange?.();
      toast.success('Contact removed');
    } catch (err) {
      toast.error('Failed to remove contact');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  const atLimit = contacts.length >= maxContacts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
        {!showAddForm && !atLimit && (
          <Button size="sm" variant="secondary" onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Add Contact
          </Button>
        )}
      </div>

      {atLimit && !showAddForm && (
        <Alert variant="info">
          You&apos;ve reached the maximum of {maxContacts} emergency contacts for your plan.
        </Alert>
      )}

      {showAddForm && (
        <Card>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">New Emergency Contact</h4>
          <EmergencyContactForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isLoading={saving}
            submitLabel="Add Contact"
          />
        </Card>
      )}

      {contacts.length === 0 && !showAddForm ? (
        <Card className="text-center py-10">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-gray-700 mb-1">No emergency contacts yet</h4>
          <p className="text-sm text-gray-500 mb-4">Add someone you trust to access your vault in an emergency.</p>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Add First Contact
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              {editingId === contact.id ? (
                <EmergencyContactForm
                  initial={contact}
                  onSubmit={(data) => handleUpdate(contact.id, data)}
                  onCancel={() => setEditingId(null)}
                  isLoading={saving}
                  submitLabel="Update Contact"
                />
              ) : deletingId === contact.id ? (
                <div>
                  <p className="text-sm text-gray-700 mb-3">
                    Remove <strong>{contact.name}</strong> as an emergency contact?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" isLoading={saving} onClick={() => handleDelete(contact.id)}>
                      Delete
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{contact.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {contact.relationship}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </span>
                      )}
                    </div>
                    {contact.lastAccessedAt && (
                      <p className="text-xs text-gray-400">
                        Last accessed: {formatDate(contact.lastAccessedAt)} · {contact.accessCount} access{contact.accessCount !== 1 ? 'es' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingId(contact.id)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingId(contact.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
