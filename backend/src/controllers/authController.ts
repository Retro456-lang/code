import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { ENV } from '../config/env.js';
import { error } from 'console';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
     const { email, password, full_name } = req.body;

      // validation
     if (!email || !password || !full_name) {
      res.status(400).json({error: "please enter all three fields email,password & full name."});
        return;
    }
     // pool.query(sql, values) sql from node.
     const existingUser = await pool.query('SELECT id from users where email = $1', [email]);
      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: "email already exists."})
        return;
      }
      const saltRounds = 10;   // blending takes 10 salt rounds 
      const passwordHash = await bcrypt.hash(password, saltRounds)

      const newUserResult = await pool.query(
        `INSERT INTO users (email, password_hash, full_name)
        values ($1, $2, $3)
        returning id, email, full_name, role, created_at`,
        [email, passwordHash, full_name]
        );
      const newUser = newUserResult.rows[0];

      // dashboard stats for user
      await pool.query(
        `insert into user_dashboard_stats (user_id, total_projects, completed_tasks, learning_streak_days)
          values($1, 0, 0, 1)`,
          [newUser.id]             // array of actual value
      );

      res.status(201).json({
        message: 'Welcome aboard.',
        user: newUser
      });
  }  catch (error) {                                   // catches anything unexpected.
    console.error('Regiser error: ', error);
    res.status(500).json({error: 'Internal server error'});
  }
};
  
// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ error: 'please enter email and password.'})
//       return;
//     }
//     // find user in db
//     const userResult = await pool.query('select * from users where email = $1' , [email]);
//     if (userResult.rows.length === 0) {
//       res.status(401).json({error: 'invalid email or password.'});
//       return;
//     }
//     const user = userResult.rows[0];

//     // compare password i.e if its valid.
//     const isPasswordValid = await bcrypt.compare(password, user.password_hash); // reblends behind the scenese 
//     if (!isPasswordValid) {
//       res.status(401).json({ error: 'invalid email or password'});
//       return;
//     }

//     // generate jwt token a signed token string.
//     const payload = { userId: user.id, email: user.email, role: user.role};
//     const token = jwt.sign(payload, ENV.JWT_SECRET, {expiresIn: '24h'});

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         full_name: user.full_name,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('login error:', error);
//     res.status(500).json({ error: 'internal server error'});
//   }
  
// };

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password} = req.body;

    if(!email || !password){
      res.status(400).json({error: "invalid email or password"})
      return;
    }

    const userResult = await pool.query('select * from users where email = $1', [email]);
    if(userResult.rows.length === 0){
      res.status(401).json({error: "invalid credentials!"})
      return;
    } 
    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid){
      res.status(401).json({error: "unauthorized error!"})
      return;
    }

    const payload = {userId: user.id, email: user.email, role: user.role}
    const token = jwt.sign(payload, ENV.JWT_SECRET, {expiresIn: '24h'})

    res.status(200).json({
      message: "logged in successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch(error){
    console.error('internal error', error)
    res.status(500).json({error: "internal server error"})
  }
}