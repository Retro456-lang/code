import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { AuthenticatedRequest } from '../types/index.js';
import { error } from 'console';



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

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as unknown as AuthenticatedRequest).user;

    const userResult = await pool.query(
      'select id, email, full_name, role, created_at from users where id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({error: "user profile not found"});
      return;
    }
    res.status(200).json({profile: userResult.rows[0]});
  } catch (error) {
    console.error('profile fetch error:', error);
    res.status(500).json({error: "internal server error"});
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

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const  { userId }= (req as unknown as AuthenticatedRequest).user;

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

export const getUsersByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = (req as unknown as AuthenticatedRequest).user;

    if (role !== 'admin') {
      res.status(403).json({ error: 'admins only'})
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({error: 'startDate and endDate and required'})
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
    select id, email, full_name, created_at
    from users
    where created_at between $1 and $2
    order by full_name asc
    limit $3 offset $4`;

    const result = await pool.query(query, [startDate, endDate, limit,offset ]);

      res.status(200).json({ users: result.rows, page, limit });

  } catch (error) {
    console.error('get users by date range error:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};
 

export const getTasksWithDetails = async(req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = (req as unknown as AuthenticatedRequest).user;

    let query = `select t.id, t.title, t.status, t.priority,
      p.name as project_name,
      u.email as assignee_email
    from tasks t
    join projects p on p.id = t.project_id
    join users u on u.id = t.user_id`;

    const params: any[] = [];

    if (role === 'employee' ) {
      params.push(userId);
      query += ` where t.user_id = $${params.length} `;

    }

    const result = await pool.query(query, params);

        res.status(200).json({ tasks: result.rows });

  } catch (error) {
    console.error('get tasks with details error:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};
 

export const getUserRegisteredAfter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = (req as unknown as AuthenticatedRequest).user;

    if (role !== 'admin') {
      res.status(403).json({error: 'admin only'})
      return;
    }

    const { date} = req.query;

    if (!date) {
      res.status(400).json({error: 'date is required.'})
      return;
    }

    const result = await pool.query('select id, email, full_name, created_at from users where created_at > $1',
        [date] )

      
        res.status(200).json({ users: result.rows });

  } catch (error) {
    console.error('get tasks with details error:', error);
    res.status(500).json({ error: 'internal server error' });
  }
  }

  export const getBlockedUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, role } = (req as unknown as AuthenticatedRequest).user;

      if (role !== 'admin') {
        res.status(403).json({error:  "admin only" })
        return;
      }

      const status = true;

      const result = await pool.query('select id,email, full_name from users where is_blocked = $1',[status])
      
      res.status(200).json({ users: result.rows});
    } catch (error){
      console.error('get blocked users error: ', error);
      res.status(500).json({ error: 'internal server error'})
    }
  }

  export const reassignTask = async (req:Request, res: Response): Promise<void> => {
    try {
      const { userId, role } = (req as unknown as AuthenticatedRequest).user;
      const { id } = req.params;
      const { newUserId } = req.body;

      if (!newUserId) {
        res.status(400).json({error: "new userid is required."})
        return;
      }
      if (role === 'employee') {
        res.status(403).json({error: 'not allowed'});
        return;
      }

      if (role === 'manager') {
        const ownsProject = await pool.query(
          `select t.id from tasks t join projects p on p.id = t_project_id
          where t.id = $1 and p.manager_id = $2`,
          [id, userId]
        );
            if (ownsProject.rows.length === 0) {
              res.status(403).json({error: 'you do not have authority'})
              return;
            }
      }
      if (role === 'admin') {
        const taskExists = await pool.query('select id from tasks where id = $1',[id])
         if (taskExists.rows.length === 0) {
        res.status(404).json({ error: 'task not found' });
        return;
      }
    }
    const updatedResult = await pool.query(
      `update tasks
      set user_id = $1, updated_at = current_timestamp
      where id = $2
      returning *`,
      [newUserId, id]
    );

    res.status(200).json({
      message: 'task reassigned successfully',
      task: updatedResult.rows[0]
    })

      } catch(error) {
        console.error('unexpected error', error)
        res.status(500).json({error: "internal server error."})
      }
    }
  
    export const getOverdueTasksByProject = async (req: Request, res: Response): Promise<void> => {
      try {
        const { role } = (req as unknown as AuthenticatedRequest).user;

        if (role !== 'admin') {
          res.status(403).json({error: 'admin only'});
          return;
        }

        const result = await pool.query(`select p.name as project_name, count(*)
          as overdue_count
          from tasks t
          join projects p on p.id = t.project_id
          where due_date < current_date and status != 'completed'
          group by p.name`)
          res.status(200).json({overdueResult: result.rows});
      } catch(error) {
        console.error('overdue error', error)
        res.status(500).json({error: "internal server error"})
      }
    }

  export const searchMyTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).user;
      const { search } = req.query;

      let query = `
      select t.* from tasks t
      join projects p on p.id = t.project_id
      where p.manager_id = $1`;

      const params: any[] = [userId];

      if (search) {
        params.push('%${search}%');
        query += `and t.title ilike $${params.length}`;
      }
      const result = await pool.query(query, params)
        res.status(200).json({ tasks: result.rows });

  } catch (error) {
    console.error('search tasks error:', error);
    res.status(500).json({ error: 'internal server error' });
  }
};

export const searchTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = (req as unknown as AuthenticatedRequest).user
    const { search } = req.query;

   let query = ` select * from tasks where 1=1`;
   const params: any[] = []

   if (role === 'employee') {
    params.push(userId)
    query += ` and user_id = $${params.length}`
   }

   if(search) {
    params.push(`%${search}%`);
    query += ` and title ilike $${params.length}`
   }

    const result = await pool.query(query, params);
    res.status(200).json({ tasks: result.rows });
  } catch(error) {
    console.error(`search tasks error: `, error);
    res.status(500).json({error: 'internal server error'})
  }
}

export const getTopPerformers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = (req as unknown as AuthenticatedRequest).user;

    if (role !== 'admin') {
      res.status(403).json({error: 'admin only'})
    }

    const secondMostTasksResult = await pool.query(`
      select user_id, count(*) as task_count
      from tasks
      group by user_id
      order by task_count desc
      limit 1 offset 1`);

    const mostProjectResult = await pool.query(`
      select manager_id, count(*) as project_count
      from projects
      group by manager_id
      order by project_count desc
      limit 1`);

    res.status(200).json({
      employeeWithSecondMostTasks: secondMostTasksResult.rows[0] || null,
      managerWithMostProjects: mostProjectResult.rows[0] || null
    });
  } catch(error){
    console.error("top performer error: ", error);
    res.status(500).json({error: 'internal server error'});
  }
}