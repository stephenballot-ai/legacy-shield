'use client';

import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';

interface EmergencyInstructionsProps {
  ownerName?: string;
  ownerEmail?: string;
}

export function EmergencyInstructions({ ownerName, ownerEmail }: EmergencyInstructionsProps) {
  const handlePrint = () => window.print();

  return (
    <div>
      {/* Print button — hidden during print */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1.5" /> Print Instructions
        </Button>
      </div>

      {/* Printable card */}
      <div className="max-w-lg mx-auto border-2 border-dashed border-gray-300 rounded-xl p-8 space-y-6 print:border-solid print:border-gray-400 print:shadow-none">
        <div className="text-center">
          <Logo size="lg" className="justify-center" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Emergency Vault Access</h2>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
            <p className="font-semibold text-gray-900 mb-1">Step 1 — Go to the emergency portal</p>
            <p className="font-mono text-primary-700 break-all">
              https://legacyshield.eu/emergency-portal
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
            <p className="font-semibold text-gray-900 mb-1">Step 2 — Enter the vault owner&apos;s email and unlock phrase</p>
            <p className="text-gray-500">
              Enter the vault owner&apos;s email address{ownerEmail && <> (<strong>{ownerEmail}</strong>)</>} and the unlock phrase exactly as it was shared with you, then click &quot;Access Vault&quot;.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
            <p className="font-semibold text-gray-900 mb-1">Step 3 — View documents</p>
            <p className="text-gray-500">
              You&apos;ll have read-only access to the documents in the vault. You can view and download them.
            </p>
          </div>
        </div>

        {/* Space for writing the phrase — print only shows the label */}
        <div className="border border-gray-300 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Unlock Phrase (write by hand — do NOT print)
          </p>
          <div className="h-16 border-b border-dotted border-gray-300" />
        </div>

        {(ownerName || ownerEmail) && (
          <div className="text-center text-xs text-gray-400 border-t pt-4">
            <p>Vault owner: {ownerName || ownerEmail}</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Keep this document in a safe place. Never store the unlock phrase digitally.
        </p>
      </div>

      {/* Print-specific global styles */}
      <style jsx global>{`
        @media print {
          body > *:not(.print-target) { }
          .print\\:hidden { display: none !important; }
          nav, header, aside, footer { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
