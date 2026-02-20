'use client';

import { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCryptoStore } from '@/store/cryptoStore';
import { useFilesStore } from '@/store/filesStore';
import { encryptFile } from '@/lib/crypto/fileEncryption';
import { filesApi } from '@/lib/api/files';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AccountEntry {
  id: string;
  type: string;
  provider: string;
  identifier: string; // email, username, or account number
  notes: string;
}

interface AccountBuilderProps {
  open: boolean;
  onClose: () => void;
}

export function AccountBuilder({ open, onClose }: AccountBuilderProps) {
  const [entries, setEntries] = useState<AccountEntry[]>([
    { id: '1', type: 'Email', provider: 'Gmail', identifier: '', notes: '' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);
  const addFile = useFilesStore((s) => s.addFile);

  const addEntry = () => {
    setEntries([...entries, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: '', 
      provider: '', 
      identifier: '', 
      notes: '' 
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof AccountEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleBuildAndUpload = async () => {
    if (!masterKey) return;
    setIsGenerating(true);

    try {
      // 1. Generate PDF (Client-side)
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Online Accounts Summary', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated via LegacyShield on ${new Date().toLocaleDateString()}`, 14, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text('This document contains a list of important online accounts for emergency reference.', 14, 40);

      // Table
      const tableData = entries.map(e => [e.type, e.provider, e.identifier, e.notes]);
      autoTable(doc, {
        startY: 45,
        head: [['Account Type', 'Provider / Bank', 'ID / Email', 'Notes']],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 45 },
      });

      // Convert to Blob
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], 'online-accounts-summary.pdf', { type: 'application/pdf' });

      // 2. Encrypt locally
      const encrypted = await encryptFile(file, masterKey, emergencyKey || undefined);

      // 3. Upload
      const { fileId, uploadUrl } = await filesApi.uploadFile({
        filename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        category: 'DIGITAL_ASSETS',
        ownerEncryptedKey: encrypted.ownerEncryptedKey,
        ownerIV: encrypted.ownerIV,
        emergencyEncryptedKey: encrypted.emergencyEncryptedKey || null,
        emergencyIV: encrypted.emergencyIV || null,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });

      await filesApi.uploadToPresignedUrl(uploadUrl, encrypted.encryptedBlob, fileId);

      // 4. Update Store
      addFile({
        id: fileId,
        userId: '', // handled by API
        filename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        category: 'DIGITAL_ASSETS',
        tags: ['auto-generated'],
        isFavorite: false,
        isEmergencyPriority: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      onClose();
    } catch (err) {
      console.error('Failed to build/upload document:', err);
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Build Online Accounts Summary</h2>
            <p className="text-xs text-gray-500">List your essential accounts. We&apos;ll generate a secure PDF for your vault.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Provider / Company</div>
            <div className="col-span-3">Username / Email</div>
            <div className="col-span-3">Notes</div>
            <div className="col-span-1"></div>
          </div>

          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 items-start group">
              <div className="md:col-span-2">
                <label className="md:hidden text-xs font-bold text-gray-400 mb-1 block">Type</label>
                <input
                  value={entry.type}
                  onChange={(e) => updateEntry(entry.id, 'type', e.target.value)}
                  placeholder="e.g. Bank"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="md:hidden text-xs font-bold text-gray-400 mb-1 block">Provider</label>
                <input
                  value={entry.provider}
                  onChange={(e) => updateEntry(entry.id, 'provider', e.target.value)}
                  placeholder="e.g. Rabobank"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="md:hidden text-xs font-bold text-gray-400 mb-1 block">ID / Email</label>
                <input
                  value={entry.identifier}
                  onChange={(e) => updateEntry(entry.id, 'identifier', e.target.value)}
                  placeholder="email or account #"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="md:hidden text-xs font-bold text-gray-400 mb-1 block">Notes</label>
                <input
                  value={entry.notes}
                  onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                  placeholder="Additional info..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-1 flex justify-end md:pt-2">
                <button 
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addEntry}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add another account
          </button>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-trust-500" />
            Generating this document will encrypt it locally using your master key.
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={onClose} disabled={isGenerating}>Cancel</Button>
            <Button 
              onClick={handleBuildAndUpload} 
              isLoading={isGenerating} 
              className="flex-1 sm:flex-none gap-2"
            >
              {!isGenerating && <Download className="h-4 w-4" />}
              Build & Secure in Vault
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
