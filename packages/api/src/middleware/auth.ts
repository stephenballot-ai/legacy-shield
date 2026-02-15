import { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../services/auth';
import { prisma } from '../lib/prisma';

// Extend Express Request to include authenticated user info
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      sessionId: string;
      sessionType: 'OWNER' | 'EMERGENCY_CONTACT';
      tier: string;
    };
  }
}

/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from Authorization header.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
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
 * Middleware that blocks EMERGENCY_CONTACT sessions.
 * Must be used after authenticate().
 */
export function requireOwner(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.sessionType !== 'OWNER') {
    res.status(403).json({
      error: {
        code: 'READ_ONLY_SESSION',
        message: 'This action requires owner access',
      },
    });
    return;
  }
  next();
}
