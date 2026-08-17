import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthenticatedRequest } from '../types/index.js';
import { profile } from 'console';


// export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.userId;

//     const userResult = await pool.query(
//       'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
//       [userId]
//     );

//     if (userResult.rows.length === 0) {
//       res.status(404).json({ error: 'User profile not found' });
//       return;
//     }

//     res.status(200).json({ profile: userResult.rows[0] });
//   } catch (error) {
//     console.error('Profile fetch error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const userResult = await pool.query(
      'select id,email,full_name, role, created_at from users where id = $1',
      [userId]
    );
  if (userResult.rows.length === 0) {
    res.status(404).json({error: "user profile not found"});
    return;
  }

  res.status(200).json({profile: userResult.rows[0]});

} catch (error) {
  console.error('profile fetch error', error);
  res.status(500).json({ error: "internal server error"});
}
};

// export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.userId;

//     const statsResult = await pool.query(
//       'SELECT total_projects, completed_tasks, learning_streak_days, last_active FROM user_dashboard_stats WHERE user_id = $1',
//       [userId]  // array of actual values filled in placeholder
//     );

//     const stats = statsResult.rows[0] || {
//       total_projects: 0,
//       completed_tasks: 0,
//       learning_streak_days: 1,
//       last_active: new Date()
//     };

//     res.status(200).json({
//       welcome_message: `Welcome back, User #${userId}!`,
//       stats
//     });
//   } catch (error) {
//     console.error('Dashboard fetch error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const statsResult = await pool.query(
           'select total_projects, completed_tasks, learning_streak_days, last_active from user_dashboard_stats where user_id = $1',
            [userId]
        );

        const stats = statsResult.rows[0] || {
          total_projects: 0,
          completed_tasks: 0,
          learning_streak_days: 1,
          last_active: new Date()
        };

        res.status(200).json({
          welcome_message: `Welcome back, User #${userId}`,
          stats
        });
    } catch(error) {
      console.log("dashboard fetch error: ", error);  // server side error debugging
      res.status(500).json({ error: 'internal server error'});
    }

}