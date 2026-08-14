"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        // 1. Validation
        if (!email || !password || !full_name) {
            res.status(400).json({ error: 'All fields (email, password, full_name) are required' });
            return;
        }
        // 2. Check if user already exists
        const existingUser = await db_1.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        // 3. Hash Password
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // 4. Insert into Database
        const newUserResult = await db_1.pool.query(`INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, role, created_at`, [email, passwordHash, full_name]);
        const newUser = newUserResult.rows[0];
        // 5. Initialize Dashboard Stats for User
        await db_1.pool.query(`INSERT INTO user_dashboard_stats (user_id, total_projects, completed_tasks, learning_streak_days)
       VALUES ($1, 0, 0, 1)`, [newUser.id]);
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        // 2. Find User in DB
        const userResult = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const user = userResult.rows[0];
        // 3. Compare Password Hashing
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // 4. Generate JWT Token
        const payload = { userId: user.id, email: user.email, role: user.role };
        const token = jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map