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

    const agent = await prisma.managedAgent.create({
      data: {
        userId: null,
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
          args: ['-y', '@legacyshield/mcp-server'],
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
    });
  } catch (err) {
    logger.error('Agent self-registration failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Agent registration failed' },
    });
  }
});

export default router;
