import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/config/database';
import logger from '@/config/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    rollNumber?: string;
    name: string;
    role: 'ADMIN' | 'STUDENT';
    brigadeId?: string;
    brigadeName?: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        rollNumber: true,
        name: true,
        role: true,
        brigadeId: true,
        brigadeName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      logger.warn('Authentication failed: User not found or inactive', {
        userId: decoded.userId,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    logger.debug('User authenticated successfully', {
      userId: user.id,
      role: user.role,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};