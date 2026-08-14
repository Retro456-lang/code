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

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_dashboard_stats_user_id ON user_dashboard_stats(user_id);
