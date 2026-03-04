import { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../services/auth';
import { prisma } from '../lib/prisma';

// Extend Express Request to include authenticated user info
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      sessionId: string;
      sessionType: 'OWNER' | 'EMERGENCY_CONTACT' | 'AGENT';
      tier: string;
      agentId?: string;
    };
  }
}

/**
 * Combined authentication middleware (JWT + API Key).
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string;

  // Handle API Key Authentication (Agent OS)
  if (apiKey) {
    try {
      const crypto = await import('crypto');
      const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      const agent = await prisma.managedAgent.findUnique({
        where: { apiKeyHash },
        include: { user: true }
      });

      if (!agent) {
        res.status(401).json({
          error: { code: 'INVALID_API_KEY', message: 'The provided API key is invalid' },
        });
        return;
      }

      // Update heartbeat and track agent "home"
      await prisma.managedAgent.update({
        where: { id: agent.id },
        data: { 
          lastHeartbeatAt: new Date(), 
          status: 'ACTIVE',
          lastIpAddress: req.ip,
          lastUserAgent: req.headers['user-agent']
        }
      });

      req.user = {
        userId: agent.userId,
        sessionId: `agent-${agent.id}`,
        sessionType: 'AGENT',
        tier: agent.user.tier,
        agentId: agent.id,
      };

      return next();
    } catch (err) {
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'API key verification failed' },
      });
      return;
    }
  }

  // Handle JWT Authentication (Human Web App)
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken<TokenPayload>(token);

    if (payload.type !== 'access') {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token type' },
      });
      return;
    }

    // Verify session still exists in DB
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired' },
      });
      return;
    }

    if (session.userId !== payload.userId || session.sessionType !== payload.sessionType) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid session context' },
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      sessionId: payload.sessionId,
      sessionType: payload.sessionType,
      tier: payload.tier,
    };

    next();
  } catch {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}

/**
 * Middleware that blocks non-owner/non-agent sessions.
 * Must be used after authenticate().
 */
export function requireOwner(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.sessionType !== 'OWNER' && req.user?.sessionType !== 'AGENT') {
    res.status(403).json({
      error: {
        code: 'READ_ONLY_SESSION',
        message: 'This action requires owner or authorized agent access',
      },
    });
    return;
  }
  next();
}
