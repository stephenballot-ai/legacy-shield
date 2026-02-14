'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmergencySetupWizard } from '@/components/emergency/EmergencySetupWizard';
import { EmergencyContactsList } from '@/components/emergency/EmergencyContactsList';
import { EmergencyInstructions } from '@/components/emergency/EmergencyInstructions';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { useAuthStore } from '@/store/authStore';
import { EMERGENCY_CONTACT_LIMITS } from '@legacy-shield/shared';
import { ShieldCheck, Printer, RotateCcw, ExternalLink } from 'lucide-react';

export default function EmergencyAccessPage() {
  const [status, setStatus] = useState<{ isSetUp: boolean; contactCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRotateWarning, setShowRotateWarning] = useState(false);
  const user = useAuthStore((s) => s.user);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await emergencyAccessApi.getStatus();
      setStatus(res);
    } catch {
      // If 404, not set up
      setStatus({ isSetUp: false, contactCount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showSetup || !status?.isSetUp) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Set Up Emergency Access</h1>
        <EmergencySetupWizard onComplete={() => { setShowSetup(false); fetchStatus(); }} />
      </div>
    );
  }

  // Determine tier limits
  const maxContacts = user?.tier === 'PRO' ? EMERGENCY_CONTACT_LIMITS.PRO_TIER : EMERGENCY_CONTACT_LIMITS.FREE_TIER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Access</h1>
        <a
          href="/emergency-portal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Test Portal <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Status card */}
      <Card className="flex items-start gap-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">Emergency Access Active</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {status.contactCount} emergency contact{status.contactCount !== 1 ? 's' : ''} configured
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="secondary" onClick={() => setShowInstructions(!showInstructions)}>
            <Printer className="h-4 w-4 mr-1.5" /> Instructions
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowRotateWarning(true)}>
            <RotateCcw className="h-4 w-4 mr-1.5" /> Rotate Key
          </Button>
        </div>
      </Card>

      {/* Rotate warning */}
      {showRotateWarning && (
        <Alert variant="warning">
          <div className="space-y-2">
            <p className="font-medium">Rotate Emergency Key?</p>
            <p>This will create a new unlock phrase. You&apos;ll need to re-share the phrase with all your emergency contacts. All file keys will be re-encrypted.</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="danger" onClick={() => { setShowRotateWarning(false); setShowSetup(true); }}>
                Start Rotation
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowRotateWarning(false)}>Cancel</Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Printable instructions */}
      {showInstructions && (
        <Card>
          <EmergencyInstructions ownerEmail={user?.email} />
        </Card>
      )}

      {/* Contacts list */}
      <EmergencyContactsList maxContacts={maxContacts} />
    </div>
  );
}
