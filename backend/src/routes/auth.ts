import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import prisma from '@/config/database';
import logger from '@/config/logger';
import { handleValidationErrors } from '@/middleware/validation';
import { authenticateToken, AuthRequest } from '@/middleware/auth';

const router = express.Router();

// Login validation
const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or roll number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isStudent').optional().isBoolean(),
];

// Login route
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { identifier, password, isStudent = false } = req.body;

    logger.info('Login attempt:', {
      identifier: isStudent ? identifier : identifier.replace(/(.{2}).*(@.*)/, '$1***$2'),
      isStudent,
      ip: req.ip,
    });

    let user;
    
    if (isStudent) {
      // For students, identifier is roll number
      user = await prisma.user.findUnique({
        where: { rollNumber: identifier },
        include: { brigade: true },
      });
    } else {
      // For admins, identifier is email
      user = await prisma.user.findUnique({
        where: { email: identifier },
      });
    }

    if (!user || !user.isActive) {
      logger.warn('Login failed: User not found or inactive', {
        identifier,
        isStudent,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role matches login type
    if (isStudent && user.role !== 'STUDENT') {
      logger.warn('Login failed: Role mismatch for student login', {
        identifier,
        userRole: user.role,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!isStudent && user.role !== 'ADMIN') {
      logger.warn('Login failed: Role mismatch for admin login', {
        identifier,
        userRole: user.role,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password', {
        userId: user.id,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info('Login successful:', {
      userId: user.id,
      role: user.role,
      ip: req.ip,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        brigadeId: user.brigadeId,
        brigadeName: user.brigadeName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        rollNumber: true,
        name: true,
        role: true,
        brigadeId: true,
        brigadeName: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  logger.info('User logged out:', {
    userId: req.user!.id,
    ip: req.ip,
  });
  
  res.json({ message: 'Logged out successfully' });
});

export default router;