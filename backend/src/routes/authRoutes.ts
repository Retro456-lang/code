import { Router } from 'express';
import { register, login, sendOtp, verifyOtp } from '../controllers/authController.js';

import { loginLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();


authRouter.post('/register', register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/send-otp', sendOtp);
