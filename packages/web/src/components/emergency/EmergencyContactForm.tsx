'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { EmergencyContact } from '@/lib/api/emergencyAccess';

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse / Partner' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'parent', label: 'Parent' },
  { value: 'friend', label: 'Friend' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'other', label: 'Other' },
];

interface EmergencyContactFormProps {
  initial?: Partial<EmergencyContact>;
  onSubmit: (data: { name: string; relationship: string; email?: string; phone?: string; notes?: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function EmergencyContactForm({ initial, onSubmit, onCancel, isLoading, submitLabel = 'Save Contact' }: EmergencyContactFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [relationship, setRelationship] = useState(initial?.relationship || 'spouse');
  const [email, setEmail] = useState(initial?.email || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        relationship,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="contact-name"
        label="Full Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jane Doe"
        error={error && !name.trim() ? 'Name is required' : undefined}
      />

      <div className="w-full">
        <label htmlFor="contact-relationship" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship
        </label>
        <select
          id="contact-relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm sm:text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {RELATIONSHIPS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <Input
        id="contact-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane@example.com"
      />

      <Input
        id="contact-phone"
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 (555) 123-4567"
      />

      <div className="w-full">
        <label htmlFor="contact-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="contact-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional instructions or context…"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm sm:text-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
