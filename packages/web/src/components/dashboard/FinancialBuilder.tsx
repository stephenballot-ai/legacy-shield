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

interface FinancialEntry {
  id: string;
  institution: string;
  type: string;
  accountNumber: string;
  notes: string;
}

interface FinancialBuilderProps {
  open: boolean;
  onClose: () => void;
}

export function FinancialBuilder({ open, onClose }: FinancialBuilderProps) {
  const [entries, setEntries] = useState<FinancialEntry[]>([
    { id: '1', institution: '', type: 'Checking', accountNumber: '', notes: '' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const masterKey = useCryptoStore((s) => s.masterKey);
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);
  const addFile = useFilesStore((s) => s.addFile);

  const addEntry = () => {
    setEntries([...entries, { 
      id: Math.random().toString(36).substr(2, 9), 
      institution: '', 
      type: '', 
      accountNumber: '', 
      notes: '' 
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof FinancialEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleBuildAndUpload = async () => {
    if (!masterKey) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); 
      doc.text('Financial Accounts Overview', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated via LegacyShield on ${new Date().toLocaleDateString()}`, 14, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('A summary of bank accounts, investments, and other financial holdings for emergency reference.', 14, 40);

      const tableData = entries.map(e => [e.institution, e.type, e.accountNumber, e.notes]);
      autoTable(doc, {
        startY: 45,
        head: [['Institution', 'Account Type', 'Account # / IBAN', 'Notes']],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 45 },
      });

      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], 'financial-overview.pdf', { type: 'application/pdf' });

      const encrypted = await encryptFile(file, masterKey, emergencyKey || undefined);

      const { fileId, uploadUrl } = await filesApi.uploadFile({
        filename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        category: 'FINANCIAL',
        ownerEncryptedKey: encrypted.ownerEncryptedKey,
        ownerIV: encrypted.ownerIV,
        emergencyEncryptedKey: encrypted.emergencyEncryptedKey || null,
        emergencyIV: encrypted.emergencyIV || null,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });

      await filesApi.uploadToPresignedUrl(uploadUrl, encrypted.encryptedBlob, fileId);

      addFile({
        id: fileId,
        userId: '',
        filename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        category: 'FINANCIAL',
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
      console.error('Failed to build/upload financial doc:', err);
      alert('Failed to generate document.');
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
            <h2 className="text-lg font-semibold text-gray-900">Build Financial Overview</h2>
            <p className="text-xs text-gray-500">List your banks and accounts. We&apos;ll generate a secure PDF for your vault.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Institution</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Account # / IBAN</div>
            <div className="col-span-3">Notes</div>
            <div className="col-span-1"></div>
          </div>

          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 items-start">
              <div className="md:col-span-3">
                <input
                  value={entry.institution}
                  onChange={(e) => updateEntry(entry.id, 'institution', e.target.value)}
                  placeholder="e.g. Rabobank"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  value={entry.type}
                  onChange={(e) => updateEntry(entry.id, 'type', e.target.value)}
                  placeholder="e.g. Checking"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  value={entry.accountNumber}
                  onChange={(e) => updateEntry(entry.id, 'accountNumber', e.target.value)}
                  placeholder="Account or IBAN"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  value={entry.notes}
                  onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                  placeholder="Beneficiary, etc."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="md:col-span-1 flex justify-end md:pt-2">
                <button 
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-30"
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

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-trust-500" />
            Locally encrypted PDF.
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleBuildAndUpload} isLoading={isGenerating} className="gap-2">
              {!isGenerating && <Download className="h-4 w-4" />}
              Build & Secure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
