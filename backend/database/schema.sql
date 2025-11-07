-- HR System Database Schema
-- PostgreSQL

-- Enable UUID extension (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS time_corrections CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP NOT NULL,
  logout_time TIMESTAMP,
  work_hours DECIMAL(5,2),
  total_break_time DECIMAL(8,2) DEFAULT 0, -- in minutes
  break_start_time TIMESTAMP,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests table
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'emergency', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_date TIMESTAMP,
  rejection_reason TEXT
);

-- Time corrections table
CREATE TABLE time_corrections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_id INTEGER NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  new_login_time TIMESTAMP NOT NULL,
  new_logout_time TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_date TIMESTAMP,
  rejection_reason TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_leave_user ON leave_requests(user_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_time_corrections_user ON time_corrections(user_id);
CREATE INDEX idx_time_corrections_status ON time_corrections(status);

-- Insert default users (passwords: admin123, manager123, employee123)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('Manager User', 'manager@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager'),
  ('Employee User', 'employee@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'employee'),
  ('John Doe', 'john@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'employee'),
  ('Sarah Smith', 'sarah@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager');

-- Sample attendance data
INSERT INTO attendance (user_id, login_time, logout_time, work_hours, total_break_time, date) VALUES
  (3, '2025-10-27 09:00:00', '2025-10-27 17:00:00', 7.5, 30, '2025-10-27'),
  (4, '2025-10-27 08:30:00', '2025-10-27 16:30:00', 7.75, 15, '2025-10-27');

-- Sample leave request
INSERT INTO leave_requests (user_id, type, start_date, end_date, days, reason, status) VALUES
  (3, 'vacation', '2025-11-01', '2025-11-05', 5, 'Family vacation', 'pending');

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE attendance IS 'Stores daily attendance records';
COMMENT ON TABLE leave_requests IS 'Stores leave/vacation requests';
COMMENT ON TABLE time_corrections IS 'Stores requests to correct attendance times';
