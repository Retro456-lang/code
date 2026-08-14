import { Router } from 'express';
import { getProfile, getDashboard } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

export const userRouter = Router();

userRouter.get('/profile', authenticateToken, getProfile);
userRouter.get('/dashboard', authenticateToken, getDashboard);
