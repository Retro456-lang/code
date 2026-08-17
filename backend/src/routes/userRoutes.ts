import { Router } from 'express';
import { getProfile, getDashboard } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const userRouter = Router();

userRouter.get('/profile', authenticateToken, getProfile);
userRouter.get('/dashboard', authenticateToken, getDashboard);
