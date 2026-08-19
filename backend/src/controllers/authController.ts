import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { ENV } from '../config/env.js';
import crypto from 'crypto';
import { error } from 'console';




// export const register = async (req: Request, res: Response): Promise<void> => {
//   try {
//      const { email, password, full_name } = req.body;

//       // validation
//      if (!email || !password || !full_name) {
//       res.status(400).json({error: "please enter all three fields email,password & full name."});
//         return;
//     }
//      // pool.query(sql, values) sql from node.
//      const existingUser = await pool.query('SELECT id from users where email = $1', [email]);
//       if (existingUser.rows.length > 0) {
//         res.status(400).json({ error: "email already exists."})
//         return;
//       }
//       const saltRounds = 10;   // blending takes 10 salt rounds 
//       const passwordHash = await bcrypt.hash(password, saltRounds)

//       const newUserResult = await pool.query(
//         `INSERT INTO users (email, password_hash, full_name)
//         values ($1, $2, $3)
//         returning id, email, full_name, role, created_at`,
//         [email, passwordHash, full_name]
//         );
//       const newUser = newUserResult.rows[0];

//       // dashboard stats for user
//       await pool.query(
//         `insert into user_dashboard_stats (user_id, total_projects, completed_tasks, learning_streak_days)
//           values($1, 0, 0, 1)`,
//           [newUser.id]             // array of actual value
//       );

//       res.status(201).json({
//         message: 'Welcome aboard.',
//         user: newUser
//       });
//   }  catch (error) {                                   // catches anything unexpected.
//     console.error('Regiser error: ', error);
//     res.status(500).json({error: 'Internal server error'});
//   }
// };

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password, full_name} = req.body

    if(!email || !password || !full_name) {
      res.status(400).json({error: "enter all three details!"})
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query('select id from users where email = $1', [normalizedEmail])
    if(existingUser.rows.length > 0) {
      res.status(401).json({error: "unauthorized error"})
      return;
    }

    const rounds = 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    const newUserResult = await pool.query(`insert into users (email, password_hash, full_name)
      values($1, $2, $3)
      returning id, email, full_name, role, created_at `, 
    [normalizedEmail, passwordHash, full_name]);

    const newUser = newUserResult.rows[0];

    await pool.query(`insert into user_dashboard_stats(user_id, total_projects, completed_tasks, learning_streak_days)
      values($1, 0, 0, 1)`,[newUser.id])

      res.status(201).json({
        message:"user created successfuly!",
        user: newUser
      })
  }catch(error){
    console.error("internal server error", error)
    res.status(500).json({error: "internal server error"})
  }
}
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

  const dummyPassword = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8bDtYnRJ7q4rGaHbF6C7ip6BpVN7gG';

  export const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const {email, password} = req.body;

      if(!email || !password) {
        res.status(400).json({error: "invalid email or password."})
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const userResult_obj = await pool.query('select id, email, password_hash, full_name from users where email = $1', [normalizedEmail])
      if (userResult_obj.rows.length === 0) {
        await bcrypt.compare(password, dummyPassword)
        res.status(401).json({error: "invalid email or password."})
        return;
    }
    const user = userResult_obj.rows[0]

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if(!isPasswordValid) {
      res.status(401).json({error: "invalid email or password."})
      return;
    }

    const payload = {userId: user.id, email: user.email, role: user.role}
    const accesstoken = jwt.sign(payload, ENV.JWT_SECRET, {expiresIn: "15m"})

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `insert into refresh_tokens (user_id, token_hash, expires_at)
      values ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "logged in successfully",
      accesstoken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,

      }
    });
  } catch(error){
    console.error('login error: ', error)
    res.status(500).json({error: "internal server error"})
  }
  }


  // export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  //     try {
  //       const { email } = req.body;

  //       if(!email) {
  //         res.status(400).json({error: "email doesnt exists!"})
  //         return;
  //       }
  //       const existingUser = await pool.query('select id from users where email = $1',[email])
  //       if (existingUser.rows.length === 0) {
  //         res.status(401).json({error: "unauthorized"})
  //         return;
  //       }
  //       const otp = Math.floor(100000 + Math.random() * 900000).toString();
  //       const expiresAt =   new Date(Date.now() + 10 * 60 * 1000);

  //       await pool.query(
  //         'update users set otp_code = $1, otp_expires_at = $2 where email = $3',
  //         [otp, expiresAt, email]
  //       );

  //       console.log(`otp for ${email}: ${otp}`);

  //       res.status(200).json({
  //         message: "otp sent to your email"
  //       })
        
  //     } catch(error) {
  //       console.error("otp login exception", error)
  //       res.status(500).json({error: "internal server error!"})
  //     }
  // }

  export const sendOtp = async(req: Request, res: Response): Promise<void> => {
    try {
      const {email} = req.body

      if(!email) {
        res.status(400).json({error :"please enter your email"})
        return;
      }
      
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await pool.query('select * from users where email = $1', [normalizedEmail])
      if(existingUser.rows.length === 0){
        res.status(401).json({error: "unauthorized"})
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000 ).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query('update users set otp_code = $1, otp_expires_at = $2 where email = $3',
        [otp, expiresAt, normalizedEmail]);

        console.log(`otp for ${normalizedEmail}: ${otp}`);

        res.status(200).json({
          message: "otp generated successfully",

        })
    } catch(error) {
      console.error("internal server error", error)
      res.status(500).json({error: "internal server error"})
    }
  }

  // export const verifyOtp = async(req: Request, res: Response): Promise<void> => {
  //   try {
  //     const {email, otp} = req.body;

  //     if(!email || !otp) {
  //       res.status(400).json({error: "email or otp doesnt exists!"})
  //       return;
  //     }
  //     const userResult = await pool.query('select otp_code from users where email = $1 and otp_expires_at > current_timestamp', [email]);
  //     if(userResult.rows.length === 0) {
  //       res.status(404).json({error: "not found error!"})
  //       return;
  //     }

  //     const user = userResult.rows[0];

  //     if(user.otp_code !== otp) {
  //       res.status(400).json({error: "incorrect otp!"})
  //       return;
  //     }

  //     await pool.query('update users set is_verified = true, otp_code = null, otp_expires_at = null where email = $1', [email]);

  //     res.status(200).json({
  //       message: "user verified successfully!",

  //     });

      
  //   }catch(error) {
  //     console.error("internal server error", error)
  //     res.status(500).json({error: "internal server error!"})
  //   }
  // }

  export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const {email, otp} = req.body;

      if(!email || !otp){
        res.status(400).json({error: "email or otp doesnt exists!"})
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const userResult = await pool.query('select otp_code from users where email = $1 and otp_expires_at > current_timestamp', [normalizedEmail])
      if(userResult.rows.length === 0){
        res.status(404).json({error: "otp expired or not found!"})
        return;
      }
      const user = userResult.rows[0];

      if(user.otp_code !== otp){
        res.status(401).json({error: "unauthorized error"})
        return;
      }

      await pool.query('update users set is_verified=true, otp_code = null, otp_expires_at = null where email = $1', [normalizedEmail])

      res.status(200).json({
        message: "user verified successfully"
      })
      
    } catch(error){
      console.error("unexpected error", error)
      res.status(500).json({error: "internal server error"})
    }
  }

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if(!refreshToken) {
       res.status(401).json({error: "missing refresh token."})
       return;
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const tokenResult = await pool.query(
      `select rt.id, u.id as user_id, u.email, u.role, u.full_name
      from refresh_tokens rt
      join users u on u.id = rt.user_id
      where rt.token_hash = $1 and rt.expires_at > current_timestamp`,
      [refreshTokenHash]
    );

    if (tokenResult.rows.length === 0) {
      res.status(401).json({error: "invalid or expired refresh token."})
      return;
    }

    const matchedRow = tokenResult.rows[0];

    await pool.query('delete from refresh_tokens where id = $1', [matchedRow.id]);

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `insert into refresh_tokens(user_id, token_hash, expires_at)
        values ($1, $2, $3)`,
        [matchedRow.user_id, newRefreshTokenHash, newExpiresAt]
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const payload = {userId: matchedRow.user_id, email: matchedRow.email, role: matchedRow.role};
    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {expiresIn: "15m"});

    res.status(200).json({
      message: "token refreshed",
      accessToken
    });
  } catch(error) {
    console.error('refresh token error', error)
    res.status(500).json({error: "internal server error"})
  }

}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?. refreshToken;

    if(refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('delete from refresh_tokens where token_hash = $1', [refreshTokenHash])
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({message: "logged out successfully."});
  } catch(error) {
    console.error('logout error: ', error)
    res.status(500).json({error: "internal server error"})
  }
}