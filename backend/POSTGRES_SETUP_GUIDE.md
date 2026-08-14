# PostgreSQL Setup Guide for Your Backend

## Step 1: Download and Install PostgreSQL

### For Windows (Your System):

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Click on "Download the installer"
   - Choose PostgreSQL version (14 or latest stable)

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Click "Next" through the welcome screen
   - Select installation directory (default is fine)
   - Select components to install:
     - ✓ PostgreSQL Server
     - ✓ pgAdmin 4
     - ✓ Stack Builder
     - ✓ Command Line Tools

3. **During Installation Setup**
   - **Password**: Set a strong password for the `postgres` user (remember this!)
   - **Port**: Keep default `5432`
   - **Locale**: Keep default
   - Click "Next" and then "Install"

4. **Post-Installation**
   - Wait for installation to complete
   - You'll be asked to launch Stack Builder (optional - click "Skip")

## Step 2: Verify PostgreSQL Installation

Open Command Prompt or PowerShell and run:
```bash
psql --version
```

You should see something like: `psql (PostgreSQL) 14.x`

## Step 3: Connect to PostgreSQL

### Option A: Using Command Line (psql)
```bash
psql -U postgres
```
When prompted, enter the password you set during installation.

### Option B: Using pgAdmin 4 (GUI)
1. Open pgAdmin 4 (installed during PostgreSQL setup)
2. Right-click "Servers" → "Register" → "Server"
3. Name: `LocalServer`
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (the password you set)

## Step 4: Create the Database and Tables

### Using Command Line (psql):

1. Open Command Prompt/PowerShell as Administrator
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Run the SQL commands from `schema.sql`:

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

   -- Create Dashboard Stats Table
   CREATE TABLE user_dashboard_stats (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES users(id) ON DELETE CASCADE,
       total_projects INT DEFAULT 0,
       completed_tasks INT DEFAULT 0,
       learning_streak_days INT DEFAULT 1,
       last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create indexes for performance
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_dashboard_stats_user_id ON user_dashboard_stats(user_id);
   ```

4. Verify creation:
   ```sql
   \dt
   ```
   You should see both `users` and `user_dashboard_stats` tables listed.

### Using pgAdmin 4 (GUI):

1. Open pgAdmin 4
2. Right-click on your server → "Create" → "Database"
3. Name: `fullstack_db`
4. Click "Save"
5. Click on the database to select it
6. Click "Tools" → "Query Tool"
7. Copy and paste the SQL from above into the query editor
8. Press F5 or click "Execute" button

### Using schema.sql File (Fastest):

1. Open Command Prompt/PowerShell
2. Navigate to your backend folder:
   ```bash
   cd c:\Users\Sales\Desktop\Code\code\backend
   ```
3. Run:
   ```bash
   psql -U postgres -f schema.sql
   ```

## Step 5: Verify Database Connection

Update your `.env` file (already done, but verify):
```
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/fullstack_db
JWT_SECRET=super_secret_jwt_key_123456
JWT_EXPIRES_IN=24h
```

Replace `YOUR_PASSWORD` with the password you set for the `postgres` user.

## Step 6: Test Connection from Backend

Run this in your backend directory:
```bash
npm run dev
```

You should see:
```
⚡ Connected to PostgreSQL Database
🚀 Server running on http://localhost:5000
```

## Common Issues & Solutions

### Issue: "psql is not recognized"
**Solution**: 
- Restart Command Prompt/PowerShell after installation
- Or add PostgreSQL to PATH manually:
  - Windows Settings → Advanced System Settings → Environment Variables
  - Find PATH variable, click Edit
  - Click New, add: `C:\Program Files\PostgreSQL\15\bin` (adjust version number)
  - Restart terminal

### Issue: "password authentication failed"
**Solution**: 
- Make sure you're using the correct password set during installation
- Reset postgres user password (if forgotten):
  ```bash
  psql -U postgres
  ALTER USER postgres WITH PASSWORD 'new_password';
  ```

### Issue: "Port 5432 already in use"
**Solution**:
- Change PostgreSQL to different port during installation (use 5433)
- Update `DATABASE_URL` in `.env` to reflect new port

### Issue: "Database does not exist"
**Solution**:
- Run the schema.sql file as shown in Step 4
- Or manually create the database using psql

## Quick Command Reference

```bash
# Connect to PostgreSQL
psql -U postgres

# List all databases
\l

# Connect to a database
\c fullstack_db

# List all tables
\dt

# Describe a table
\d users

# Exit psql
\q
```

## Next Steps

Once PostgreSQL is set up and running:
1. Your backend server can start with `npm run dev`
2. Test the API endpoints:
   - Register: `POST http://localhost:5000/api/auth/register`
   - Login: `POST http://localhost:5000/api/auth/login`
   - Profile: `GET http://localhost:5000/api/user/profile`
   - Dashboard: `GET http://localhost:5000/api/user/dashboard`

3. Use tools like Postman or VS Code REST Client to test
