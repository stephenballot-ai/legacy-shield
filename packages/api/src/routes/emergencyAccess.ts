import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, requireOwner } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  setupEmergencyAccessSchema,
  validateEmergencyPhraseSchema,
  rotateEmergencyKeySchema,
  createContactSchema,
  updateContactSchema,
} from './emergencyAccess.validation';
import {
  setupEmergencyAccess,
  validateEmergencyPhrase,
  rotateEmergencyKey,
  addEmergencyContact,
  listEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../services/emergencyAccess';

const router = Router();

// Rate limiter for emergency phrase validation: 3 attempts per 15 minutes per IP
const emergencyValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Too many attempts. Please try again in 15 minutes.',
    },
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
});

// ============================================================================
// POST /emergency-access/setup — Owner sets up emergency access
// ============================================================================
router.post('/setup', authenticate, requireOwner, validate(setupEmergencyAccessSchema), async (req: Request, res: Response) => {
  try {
    const result = await setupEmergencyAccess(
      req.user!.userId,
      req.body,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Emergency access setup failed' },
    });
  }
});

// ============================================================================
// POST /emergency-access/validate — PUBLIC: Validate emergency phrase
// ============================================================================
router.post('/validate', emergencyValidateLimiter, validate(validateEmergencyPhraseSchema), async (req: Request, res: Response) => {
  try {
    const { emergencyPhraseHash } = req.body as { emergencyPhraseHash: string };

    const result = await validateEmergencyPhrase(emergencyPhraseHash, req);

    if (!result) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid emergency phrase' },
      });
      return;
    }

    res.json({
      accessToken: result.accessToken,
      userId: result.userId,
      emergencyKeyEncrypted: result.emergencyKeyEncrypted,
      emergencyKeySalt: result.emergencyKeySalt,
    });
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Emergency access validation failed' },
    });
  }
});

// ============================================================================
// POST /emergency-access/rotate-key — Owner rotates emergency key
// ============================================================================
router.post('/rotate-key', authenticate, requireOwner, validate(rotateEmergencyKeySchema), async (req: Request, res: Response) => {
  try {
    const result = await rotateEmergencyKey(
      req.user!.userId,
      req.body,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Emergency key rotation failed' },
    });
  }
});

// ============================================================================
// GET /emergency-access/contacts — List contacts
// ============================================================================
router.get('/contacts', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const contacts = await listEmergencyContacts(req.user!.userId);
    res.json({ contacts });
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list emergency contacts' },
    });
  }
});

// ============================================================================
// POST /emergency-access/contacts — Add contact
// ============================================================================
router.post('/contacts', authenticate, requireOwner, validate(createContactSchema), async (req: Request, res: Response) => {
  try {
    const result = await addEmergencyContact(
      req.user!.userId,
      req.user!.tier,
      req.body,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );

    if (result.error) {
      res.status(403).json({
        error: { code: result.code, message: result.message },
      });
      return;
    }

    res.status(201).json(result.contact);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add emergency contact' },
    });
  }
});

// ============================================================================
// PATCH /emergency-access/contacts/:id — Update contact
// ============================================================================
router.patch('/contacts/:id', authenticate, requireOwner, validate(updateContactSchema), async (req: Request, res: Response) => {
  try {
    const result = await updateEmergencyContact(
      req.params.id,
      req.user!.userId,
      req.body,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );

    if (!result) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Emergency contact not found' },
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update emergency contact' },
    });
  }
});

// ============================================================================
// DELETE /emergency-access/contacts/:id — Delete contact
// ============================================================================
router.delete('/contacts/:id', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const result = await deleteEmergencyContact(
      req.params.id,
      req.user!.userId,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );

    if (!result) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Emergency contact not found' },
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete emergency contact' },
    });
  }
});

export default router;
