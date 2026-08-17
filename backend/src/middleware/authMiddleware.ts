import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest, UserPayload } from '../types/index.js';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Step 1: Extract Authorization header ('Bearer <token>')
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing or invalid' });
    return;
  }

  try {
    // Step 2: Verify token signature
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserPayload;
    // Step 3: Attach user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token is invalid or expired' });
    return;
  }
};
