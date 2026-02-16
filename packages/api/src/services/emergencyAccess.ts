import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createSession, logAudit } from './auth';
import { sendEmergencyContactNotification, sendVaultAccessNotification } from '../lib/email';

const EMERGENCY_CONTACT_LIMITS = { FREE: 1, PRO: 5 } as const;

// ============================================================================
// SETUP EMERGENCY ACCESS
// ============================================================================

export async function setupEmergencyAccess(
  userId: string,
  data: { emergencyPhraseHash: string; emergencyKeyEncrypted: string; emergencyKeySalt: string },
  context: { ipAddress?: string; userAgent?: string }
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emergencyPhraseHash: data.emergencyPhraseHash,
      emergencyKeyEncrypted: data.emergencyKeyEncrypted,
      emergencyKeySalt: data.emergencyKeySalt,
    },
  });

  await logAudit({
    userId,
    action: 'EMERGENCY_ACCESS_SETUP',
    resourceType: 'user',
    resourceId: userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return { success: true };
}

// ============================================================================
// VALIDATE EMERGENCY PHRASE
// ============================================================================

export async function validateEmergencyPhrase(
  ownerEmail: string,
  emergencyPhraseHash: string,
  req: { ip?: string; headers: Record<string, string | string[] | undefined> }
): Promise<{ accessToken: string; userId: string; emergencyKeyEncrypted: string; emergencyKeySalt: string } | null> {
  // Find user by email and phrase hash
  const user = await prisma.user.findFirst({
    where: {
      email: ownerEmail.toLowerCase(),
      emergencyPhraseHash,
      emergencyKeyEncrypted: { not: null },
    },
  });

  if (!user) {
    return null;
  }

  // Constant-time comparison
  const storedHash = Buffer.from(user.emergencyPhraseHash ?? '');
  const providedHash = Buffer.from(emergencyPhraseHash);
  if (storedHash.length !== providedHash.length || !crypto.timingSafeEqual(storedHash, providedHash)) {
    return null;
  }

  // Create emergency session
  const { accessToken } = await createSession(user.id, 'EMERGENCY_CONTACT', req);

  await logAudit({
    userId: user.id,
    action: 'EMERGENCY_PHRASE_VALIDATED',
    resourceType: 'user',
    resourceId: user.id,
    sessionType: 'EMERGENCY_CONTACT',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string | undefined,
  });

  // Also log as EMERGENCY_ACCESS_USED
  await logAudit({
    userId: user.id,
    action: 'EMERGENCY_ACCESS_USED',
    resourceType: 'user',
    resourceId: user.id,
    sessionType: 'EMERGENCY_CONTACT',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string | undefined,
  });

  // Notify vault owner that their vault was accessed (fire-and-forget)
  sendVaultAccessNotification({
    ownerEmail: user.email,
    accessIp: req.ip,
    accessDate: new Date(),
  }).catch((err) => console.error('[email] Vault access notification failed:', err));

  return {
    accessToken,
    userId: user.id,
    emergencyKeyEncrypted: user.emergencyKeyEncrypted!,
    emergencyKeySalt: user.emergencyKeySalt!,
  };
}

// ============================================================================
// ROTATE EMERGENCY KEY
// ============================================================================

export async function rotateEmergencyKey(
  userId: string,
  data: { newEmergencyPhraseHash: string; newEmergencyKeyEncrypted: string; newEmergencyKeySalt: string },
  context: { ipAddress?: string; userAgent?: string }
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emergencyPhraseHash: data.newEmergencyPhraseHash,
      emergencyKeyEncrypted: data.newEmergencyKeyEncrypted,
      emergencyKeySalt: data.newEmergencyKeySalt,
    },
  });

  await logAudit({
    userId,
    action: 'EMERGENCY_KEY_ROTATED',
    resourceType: 'user',
    resourceId: userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return { success: true };
}

// ============================================================================
// EMERGENCY CONTACT CRUD
// ============================================================================

export async function addEmergencyContact(
  userId: string,
  tier: string,
  data: { name: string; relationship: string; email?: string; phone?: string; notes?: string },
  context: { ipAddress?: string; userAgent?: string }
) {
  // Enforce tier limits
  const maxContacts = tier === 'PRO' ? EMERGENCY_CONTACT_LIMITS.PRO : EMERGENCY_CONTACT_LIMITS.FREE;
  const currentCount = await prisma.emergencyContact.count({ where: { userId } });

  if (currentCount >= maxContacts) {
    return {
      error: true as const,
      code: 'CONTACT_LIMIT_REACHED',
      message: `Emergency contact limit reached (${maxContacts}). ${tier === 'FREE' ? 'Upgrade to Pro for up to 5 contacts.' : ''}`,
    };
  }

  const contact = await prisma.emergencyContact.create({
    data: {
      userId,
      name: data.name,
      relationship: data.relationship,
      email: data.email ?? null,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
    },
  });

  await logAudit({
    userId,
    action: 'EMERGENCY_ACCESS_SETUP',
    resourceType: 'emergency_contact',
    resourceId: contact.id,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { action: 'contact_added', name: data.name },
  });

  // Send notification email to the contact (fire-and-forget)
  if (data.email) {
    const owner = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    sendEmergencyContactNotification({
      contactEmail: data.email,
      contactName: data.name,
      ownerName: owner?.email ?? 'Someone',
    }).catch((err) => console.error('[email] Emergency contact notification failed:', err));
  }

  return { error: false as const, contact };
}

export async function listEmergencyContacts(userId: string) {
  return prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      relationship: true,
      email: true,
      phone: true,
      notes: true,
      lastAccessedAt: true,
      accessCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateEmergencyContact(
  contactId: string,
  userId: string,
  data: { name?: string; relationship?: string; email?: string | null; phone?: string | null; notes?: string | null },
  context: { ipAddress?: string; userAgent?: string }
) {
  // Verify ownership
  const contact = await prisma.emergencyContact.findFirst({
    where: { id: contactId, userId },
  });

  if (!contact) return null;

  const updated = await prisma.emergencyContact.update({
    where: { id: contactId },
    data,
    select: {
      id: true,
      name: true,
      relationship: true,
      email: true,
      phone: true,
      notes: true,
      lastAccessedAt: true,
      accessCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logAudit({
    userId,
    action: 'EMERGENCY_ACCESS_SETUP',
    resourceType: 'emergency_contact',
    resourceId: contactId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { action: 'contact_updated', updatedFields: Object.keys(data) },
  });

  return updated;
}

export async function deleteEmergencyContact(
  contactId: string,
  userId: string,
  context: { ipAddress?: string; userAgent?: string }
) {
  // Verify ownership
  const contact = await prisma.emergencyContact.findFirst({
    where: { id: contactId, userId },
  });

  if (!contact) return null;

  await prisma.emergencyContact.delete({ where: { id: contactId } });

  await logAudit({
    userId,
    action: 'EMERGENCY_ACCESS_SETUP',
    resourceType: 'emergency_contact',
    resourceId: contactId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { action: 'contact_deleted', name: contact.name },
  });

  return { id: contactId, deleted: true };
}

export async function logEmergencyAccess(
  contactId: string,
  userId: string,
  context: { ipAddress?: string; userAgent?: string }
) {
  await prisma.emergencyContact.update({
    where: { id: contactId },
    data: {
      lastAccessedAt: new Date(),
      accessCount: { increment: 1 },
    },
  });

  await logAudit({
    userId,
    action: 'EMERGENCY_ACCESS_USED',
    resourceType: 'emergency_contact',
    resourceId: contactId,
    sessionType: 'EMERGENCY_CONTACT',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}
