import { Request, Response } from "express";
import { pool } from "../config/db.js";
import { AuthenticatedRequest } from "../types/index.js";
import { error } from "console";


export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = (req as unknown as AuthenticatedRequest).user;
        const { status, priority} = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let query = 'select * from tasks where user_id = $1';
        const params: any[] = [userId];

        if (status) {
            params.push(status);
            query += ` and status = $${params.length}`;
        }

        if (priority) {
            params.push(priority);
            query += ` and priority = $${params.length}`;
        }

        params.push(limit);
        query += ` limit $${params.length}`;

        params.push(offset);
        query += ` offset $${params.length}`;

        const tasksResult = await pool.query(query, params);

        res.status(200).json({tasks: tasksResult.rows, page, limit});
    } catch (error) {
        console.error('get tasks error: ', error)
        res.status(500).json({error: "internal server error"});
    }
}

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = (req as unknown as AuthenticatedRequest).user;
        const { id } = req.params;

    let query = 'select * from tasks where id = $1';
    const params: any[] = [id];

    if (role === 'employee') {
        params.push(userId);
        query += ` and user_id = $${params.length}`;
    }

        const taskResult = await pool.query(query, params); 

    if (taskResult.rows.length === 0) {
        res.status(404).json({error: "task not found"});
        return;
    }
        res.status(200).json({ task: taskResult.rows[0] });
    
    } catch (error) {
        console.error('get task error:', error);
        res.status(500).json({ error: 'internal server errir'});
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role} = (req as unknown as AuthenticatedRequest).user;
        const { id } = req.params;
        const { title, description, status, priority, due_date} = req.body;

        let query = 'select * from tasks where id = $1';
        const params: any[] = [id];

         if (role === 'employee') {
        params.push(userId);
        query += ` and user_id = $${params.length}`;
    }
        
        const taskResult = await pool.query(query, params);
        if (taskResult.rows.length === 0) {
            res.status(404).json({error: "task not found"});
            return;
        }

    let setClauses: string[] = [];
    const updateParams: any[] = [];

        if (role === 'employee') {
            if(status) {
                updateParams.push(status);
                setClauses.push(`status = $${updateParams.length}`)
            }
        }
        else {
    if (title) {
        updateParams.push(title);
        setClauses.push(`title = $${updateParams.length}`);
    }

     if (description) {
        updateParams.push(description);
        setClauses.push(`description = $${updateParams.length}`);
    }

     if (status) {
        updateParams.push(status);
        setClauses.push(`status = $${updateParams.length}`);
    }

    if (priority) {
        updateParams.push(priority)
        setClauses.push(`priority = $${updateParams.length}`)
    }

    if (due_date) {
        updateParams.push(due_date)
        setClauses.push(`due_date = $${updateParams.length}`)
    }
        }
    if (setClauses.length === 0) {
        res.status(400).json({error: "no fields provided to update."})
        return;
    }
    
    updateParams.push(id);
    const updateQuery = `update tasks set ${setClauses.join(', ')}, updated_at = current_timestamp where id = $${updateParams.length} returning *`;
    const updatedResult = await pool.query(updateQuery, updateParams);

    res.status(200).json({message: "task updated successfully", task: updatedResult.rows[0]});

    } catch(error){
        console.error("unexpected error", error);
        res.status(500).json({error: "internal server errr"})
    }
}


export const deleteTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, role } = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;
 
    let query = "select * from tasks where id = $1";
    const params: any[] = [id];
 
    if (role === "employee") {
      params.push(userId);
      query += ` and user_id = $${params.length}`;
    }
 
    const taskResult = await pool.query(query, params);
    if (taskResult.rows.length === 0) {
      res.status(404).json({ error: "task not found!" });
      return;
    }
 
    const deleteResult = await pool.query(
      "delete from tasks where id = $1 returning *",
      [id],
    );
 
    res.status(200).json({
      message: "task deleted successfully",
      task: deleteResult.rows[0],
    });
  } catch (error) {
    console.error("unexpected error", error);
    res.status(500).json({ error: "internal server error" });
  }
};
 
export const getTaskwithNoDueDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, role } = (req as unknown as AuthenticatedRequest).user;
 
    let query = "select * from tasks where due_date is null";
    const params: any[] = [];
 
    if (role === "employee") {
      params.push(userId);
      query += ` and user_id = $${params.length}`;
    }
 
    const result = await pool.query(query, params);
    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error("get tasks error: ", error);
    res.status(500).json({ error: "internal server error" });
  }
};
 
export const getRecentTasks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, role } = (req as unknown as AuthenticatedRequest).user;
 
    let query = "select * from tasks";
    const params: any[] = [];
 
    if (role === "employee") {
      params.push(userId);
      query += ` where user_id = $${params.length}`;
    }
 
    query += ` order by created_at desc limit 3`;
 
    const result = await pool.query(query, params);
    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error("get recent tasks error: ", error);
    res.status(500).json({ error: "internal server error" });
  }
};
 
export const getTaskCountsByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { role } = (req as unknown as AuthenticatedRequest).user;
 
    if (role !== "admin") {
      res.status(403).json({ error: "admins only" });
      return;
    }
 
    const result = await pool.query(
      "select user_id, count(*) as task_count from tasks group by user_id",
    );
 
    res.status(200).json({ counts: result.rows });
  } catch (error) {
    console.error("get task counts error:", error);
    res.status(500).json({ error: "internal server error" });
  }
};
 
export const getTaskCountsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = (req as unknown as AuthenticatedRequest).user;

      if (role !== "admin") {
      res.status(403).json({ error: "admins only" });
      return;
    }

    const result = await pool.query(
        `select user_id, count(*) as task_count from tasks where status = $1 group by user_id`, ['completed']
    );
           res.status(200).json({ counts: result.rows });
  } catch (error) {
    console.error("get task counts error:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getAllTasksSortedByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = (req as unknown as AuthenticatedRequest).user;

        if (role !== 'admin') {
            res.status(403).json({error: 'admins only'})
            return;
        }

        const result = await pool.query(
            `select * from tasks order by user_id, created_at desc `
        );
        
           res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error("get task counts error:", error);
    res.status(500).json({ error: "internal server error" });
  }
}; 

export const getAverageTasksPerPriority = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = (req as unknown as AuthenticatedRequest).user;

        if (role !== 'admin') {
            res.status(403).json({error: 'admins only'})
            return;
        }

        const result = await pool.query(`
            select priority, avg(task_count) as average_tasks
            from (
            select user_id, priority, count(*) as task_count
            from tasks
            group by user_id, priority) as user_priority_counts
            group by priority`);

                
           res.status(200).json({ tasksByPriority: result.rows });
  } catch (error) {
    console.error("get task counts error:", error);
    res.status(500).json({ error: "internal server error" });
  }
};
    