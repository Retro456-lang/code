"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = exports.getProfile = void 0;
const db_1 = require("../config/db");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userResult = await db_1.pool.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }
        res.status(200).json({ profile: userResult.rows[0] });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const getDashboard = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const statsResult = await db_1.pool.query('SELECT total_projects, completed_tasks, learning_streak_days, last_active FROM user_dashboard_stats WHERE user_id = $1', [userId]);
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
    }
    catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboard = getDashboard;
//# sourceMappingURL=userController.js.map