import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { authenticate, requireOwner } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { logAudit } from '../services/auth';

const router = Router();

/**
 * GET /agents/whoami
 * Returns the current agent's profile. Useful for confirming auth works.
 */
router.get('/whoami', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.sessionType !== 'AGENT' || !req.user?.agentId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'This endpoint is for agents only' } });
      return;
    }

    const agent = await prisma.managedAgent.findUnique({
      where: { id: req.user.agentId },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        status: true,
        lastHeartbeatAt: true,
        createdAt: true,
      },
    });

    if (!agent) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
      return;
    }

    res.json({
      agent,
      availableEndpoints: {
        'GET /api/v1/files': 'List vault files',
        'POST /api/v1/files/upload': 'Create file record (returns presigned upload URL)',
        'PUT /api/v1/files/:id/blob': 'Upload encrypted file blob',
        'GET /api/v1/files/:id': 'Get file details + download URL',
        'GET /api/v1/files/:id/blob': 'Download encrypted file blob',
        'PATCH /api/v1/files/:id': 'Update file metadata',
        'DELETE /api/v1/files/:id': 'Delete file',
        'GET /api/v1/agents/whoami': 'This endpoint',
      },
    });
  } catch (err) {
    logger.error('Agent whoami failed:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get agent profile' } });
  }
});

/**
 * POST /agents/register
 * Creates a new ManagedAgent and returns the plain API Key.
 * Only the owner can call this.
 */
router.post('/register', authenticate, requireOwner, async (req: Request, res: Response) => {
  if (req.user?.sessionType !== 'OWNER') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only account owners can register agents' } });
    return;
  }

  try {
    const { name, description, scopes } = req.body;

    // Generate a secure API Key
    const apiKey = `ls_${crypto.randomBytes(32).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const agent = await prisma.managedAgent.create({
      data: {
        userId: req.user.userId,
        name,
        description,
        scopes: scopes || [],
        apiKeyHash,
      }
    });

    await logAudit({
      userId: req.user.userId,
      action: 'AGENT_CREATED' as any,
      resourceType: 'agent',
      resourceId: agent.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // We only return the API key once. It's never stored in plain text.
    res.status(201).json({
      agentId: agent.id,
      apiKey,
      message: 'Agent registered successfully. Save this API key, it will not be shown again.'
    });
  } catch (err) {
    logger.error('Agent registration failed:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to register agent' } });
  }
});

/**
 * GET /agents
 * List all agents for the current user.
 */
router.get('/', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const agents = await prisma.managedAgent.findMany({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        status: true,
        lastHeartbeatAt: true,
        createdAt: true
      }
    });
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch agents' } });
  }
});

/**
 * DELETE /agents/:id
 * Revoke an agent's access.
 */
router.delete('/:id', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const agent = await prisma.managedAgent.findUnique({ where: { id: req.params.id } });
    if (!agent || agent.userId !== req.user!.userId) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
      return;
    }

    await prisma.managedAgent.delete({ where: { id: agent.id } });

    await logAudit({
      userId: req.user!.userId,
      action: 'AGENT_DELETED' as any,
      resourceType: 'agent',
      resourceId: agent.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke agent' } });
  }
});

export default router;
