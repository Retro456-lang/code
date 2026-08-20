import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest, UserPayload } from '../types/index.js';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing or invalid' });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserPayload;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token is invalid or expired' });
    return;
  }
};