import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';

export const app = express();

app.set('trust proxy', 1) //for one user. each key

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});
