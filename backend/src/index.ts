import { app } from './app.js';
import { ENV } from './config/env.js';
import { pool } from './config/db.js';

async function start() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', (err as Error).message);
  }

  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
    console.log(`Health check: http://localhost:${ENV.PORT}/health`);
  });
}

start();
