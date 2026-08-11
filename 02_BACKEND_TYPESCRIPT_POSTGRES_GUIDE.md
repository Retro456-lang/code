# 02. Backend TypeScript + Express + PostgreSQL + JWT Guide

This guide details the complete architecture, setup, SQL schema, and step-by-step code structure for the 4 core APIs:
1. `POST /api/auth/register` (Register User)
2. `POST /api/auth/login` (Login User & Issue JWT)
3. `GET /api/user/profile` (Protected Profile Route)
4. `GET /api/dashboard` (Protected Dashboard Metrics Route)

---

## 1. Project Setup & Package Configurations

### Step 1: Initialize Node & Install Dependencies
Run the following commands in your backend root folder:

```bash
# Initialize Node project
npm init -y

# Production Dependencies
npm install express pg bcryptjs jsonwebtoken dotenv cors

# Development Dependencies
npm install -D typescript @types/node @types/express @types/pg @types/bcryptjs @types/jsonwebtoken @types/cors ts-node-dev
```

### Step 2: Configure TypeScript (`tsconfig.json`)
Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Step 3: Configure Scripts in `package.json`
Add the dev script:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
}
```

### Step 4: Directory Structure
Organize your `src` directory as follows:

```
backend/
├── .env
├── package.json
├── tsconfig.json
└── src/
    ├── config/
    │   ├── db.ts
    │   └── env.ts
    ├── controllers/
    │   ├── authController.ts
    │   └── userController.ts
    ├── middleware/
    │   └── authMiddleware.ts
    ├── routes/
    │   ├── authRoutes.ts
    │   └── userRoutes.ts
    ├── types/
    │   └── index.ts
    ├── app.ts
    └── index.ts
```

---

## 2. Database Schema (`schema.sql`)

Run this SQL in your PostgreSQL terminal (`psql` or pgAdmin):

```sql
-- Create Database
CREATE DATABASE fullstack_db;

-- Connect to database
\c fullstack_db;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dashboard Stats Table (Associated with User)
CREATE TABLE user_dashboard_stats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    total_projects INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    learning_streak_days INT DEFAULT 1,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Step-by-Step Code Structure Templates

### A. Environment Configuration (`src/config/env.ts` & `.env`)
```typescript
// .env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/fullstack_db
JWT_SECRET=super_secret_jwt_key_123456
JWT_EXPIRES_IN=24h

// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};
```

### B. PostgreSQL Connection Pool (`src/config/db.ts`)
```typescript
import { Pool } from 'pg';
import { ENV } from './env.js';

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL
});

pool.on('connect', () => {
  console.log('⚡ Connected to PostgreSQL Database');
});
```

### C. Types & Custom Request Definition (`src/types/index.ts`)
```typescript
import { Request } from 'express';

export interface UserPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
```

### D. JWT Authentication Middleware (`src/middleware/authMiddleware.ts`)
```typescript
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
```

### E. Auth Controller: Register & Login (`src/controllers/authController.ts`)
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { ENV } from '../config/env.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    // 1. Validation
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'All fields (email, password, full_name) are required' });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // 3. Hash Password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert into Database
    const newUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, full_name]
    );

    const newUser = newUserResult.rows[0];

    // 5. Initialize Dashboard Stats for User
    await pool.query(
      `INSERT INTO user_dashboard_stats (user_id, total_projects, completed_tasks, learning_streak_days)
       VALUES ($1, 0, 0, 1)`,
      [newUser.id]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // 2. Find User in DB
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = userResult.rows[0];

    // 3. Compare Password Hashing
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // 4. Generate JWT Token
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### F. User Controller: Profile & Dashboard (`src/controllers/userController.ts`)
```typescript
import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const userResult = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.status(200).json({ profile: userResult.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const statsResult = await pool.query(
      'SELECT total_projects, completed_tasks, learning_streak_days, last_active FROM user_dashboard_stats WHERE user_id = $1',
      [userId]
    );

    const stats = statsResult.rows[0] || {
      total_projects: 0,
      completed_tasks: 0,
      learning_streak_days: 1,
      last_active: new Date()
    };

    res.status(200).json({
      welcome_message: `Welcome back, User #${userId}!`,
      stats
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### G. Routes & Express App Wireup (`src/routes/...` and `src/index.ts`)
```typescript
// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);

// src/routes/userRoutes.ts
import { Router } from 'express';
import { getProfile, getDashboard } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
export const userRouter = Router();
userRouter.get('/profile', authenticateToken, getProfile);
userRouter.get('/dashboard', authenticateToken, getDashboard);

// src/app.ts
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// src/index.ts
import { app } from './app.js';
import { ENV } from './config/env.js';

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
});
```
