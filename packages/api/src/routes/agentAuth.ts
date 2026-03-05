import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { agentRegisterLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /api/v1/auth/agent-register
 * Public self-signup for autonomous agents.
 * No user auth required — any agent can call this to get an API key.
 * Rate limited to 5 registrations per hour per IP.
 */
router.post('/agent-register', agentRegisterLimiter, async (req: Request, res: Response) => {
  try {
    const { name, description, agentIdentity } = req.body as {
      name?: string;
      description?: string;
      agentIdentity?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'name is required' },
      });
      return;
    }

    if (name.trim().length > 100) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'name must be 100 characters or fewer' },
      });
      return;
    }

    const apiKey = `ls_${crypto.randomBytes(32).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Create a system User record for this agent so it can own files
    const agentUser = await prisma.user.create({
      data: {
        email: `agent-${crypto.randomUUID()}@agent.legacyshield.internal`,
        passwordHash: 'AGENT_NO_PASSWORD',
        emailVerified: true,
        tier: 'FREE',
        referralCode: `agent-${crypto.randomBytes(6).toString('hex')}`,
        keyDerivationSalt: crypto.randomBytes(32).toString('base64'),
      },
    });

    const agent = await prisma.managedAgent.create({
      data: {
        userId: agentUser.id,
        name: name.trim(),
        description: description?.trim() ?? null,
        apiKeyHash,
        scopes: [],
        status: 'ACTIVE',
      },
    });

    logger.info({
      event: 'AGENT_SELF_REGISTERED',
      agentId: agent.id,
      agentIdentity: agentIdentity ?? null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const mcpConfig = {
      mcpServers: {
        'legacy-shield': {
          command: 'npx',
          args: ['-y', '@legacy-shield/mcp-server'],
          env: {
            LEGACY_SHIELD_API_KEY: apiKey,
            LEGACY_SHIELD_API_URL: 'https://api.legacyshield.eu/api/v1',
          },
        },
      },
    };

    res.status(201).json({
      agentId: agent.id,
      apiKey,
      message: 'Agent registered. Save this API key — it will not be shown again.',
      mcpConfig,
      nextSteps: {
        '1': 'GET /api/v1/agents/whoami — confirm auth works, see your profile',
        '2': 'GET /api/v1/files — list your vault (empty initially)',
        '3': 'POST /api/v1/files/upload — create a file record (returns fileId)',
        '4': 'PUT /api/v1/files/:id/blob — upload the encrypted file bytes',
        '5': 'GET /api/v1/files/:id/blob — download encrypted file bytes',
      },
      endpoints: {
        'GET /api/v1/agents/whoami': 'Your agent profile + full endpoint map',
        'GET /api/v1/files': 'List vault files (paginated: ?limit=&offset=)',
        'POST /api/v1/files/upload': 'Create file record — body: {filename, mimeType, fileSizeBytes, category, ownerEncryptedKey, ownerIV, iv, authTag}',
        'PUT /api/v1/files/:id/blob': 'Upload encrypted file blob (raw bytes)',
        'GET /api/v1/files/:id': 'Get file metadata',
        'GET /api/v1/files/:id/blob': 'Download encrypted file blob',
        'PATCH /api/v1/files/:id': 'Update file metadata (filename, category, tags)',
        'DELETE /api/v1/files/:id': 'Delete a file',
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keySize: 32,
        ivSize: 12,
        format: 'base64 for all crypto params, raw bytes for blob',
        categories: ['IDENTITY', 'LEGAL', 'FINANCIAL', 'INSURANCE', 'MEDICAL', 'TAX', 'PROPERTY', 'CRYPTO', 'OTHER'],
      },
    });
  } catch (err) {
    logger.error('Agent self-registration failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Agent registration failed' },
    });
  }
});

export default router;
