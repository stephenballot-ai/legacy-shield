import { Router, Request, Response } from 'express';
import { authenticate, requireOwner } from '../middleware/auth';
import { verifyPassword, logAudit, invalidateAllUserSessions } from '../services/auth';
import { getSubscriptionStatus } from '../services/stripe';
import { prisma } from '../lib/prisma';
import { DOCUMENT_LIMITS, EMERGENCY_CONTACT_LIMITS } from '@legacy-shield/shared';

const router = Router();

// GET /users/me
router.get('/me', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        tier: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { files: true, emergencyContacts: true } },
      },
    });
    if (!user) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const subscription = await getSubscriptionStatus(req.user!.userId);
    const tier = user.tier as 'FREE' | 'PRO';

    res.json({
      ...user,
      documentCount: user._count.files,
      emergencyContactCount: user._count.emergencyContacts,
      documentLimit: DOCUMENT_LIMITS[`${tier}_TIER`],
      emergencyContactLimit: EMERGENCY_CONTACT_LIMITS[`${tier}_TIER`],
      subscription,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get user profile' } });
  }
});

// PATCH /users/me
router.patch('/me', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.user!.userId) {
      res.status(409).json({ error: { code: 'RESOURCE_ALREADY_EXISTS', message: 'Email already in use' } });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { email, emailVerified: false },
      select: { id: true, email: true, tier: true, emailVerified: true, twoFactorEnabled: true },
    });

    await logAudit({
      userId: req.user!.userId,
      action: 'EMAIL_CHANGED',
      resourceType: 'user',
      resourceId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } });
  }
});

// DELETE /users/me
router.delete('/me', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { password, confirmation } = req.body as { password: string; confirmation: string };

    if (confirmation !== 'DELETE MY ACCOUNT') {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Please type "DELETE MY ACCOUNT" to confirm' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect password' } });
      return;
    }

    await logAudit({
      userId: user.id,
      action: 'ACCOUNT_DELETED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await invalidateAllUserSessions(user.id);
    await prisma.user.delete({ where: { id: user.id } });

    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' } });
  }
});

export default router;
