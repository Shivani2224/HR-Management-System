# Backend Setup Guide

## Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

---

## Step-by-Step Setup

### 1. Navigate to Backend Folder

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- express (Web framework)
- cors (Cross-Origin Resource Sharing)
- pg (PostgreSQL client)
- bcrypt (Password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (Environment variables)
- nodemon (Auto-restart during development)

### 3. Setup PostgreSQL Database

#### Option A: Using Command Line

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hr_system;

# Exit PostgreSQL
\q
```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it `hr_system`
5. Click "Save"

### 4. Create Environment File

Copy the example env file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

JWT_SECRET=change-this-to-random-string-in-production

FRONTEND_URL=http://localhost:5173
```

**IMPORTANT:** Change `DB_PASSWORD` to your PostgreSQL password!

### 5. Run Database Schema

Execute the SQL schema file to create tables:

```bash
# Method 1: Using command line
psql -U postgres -d hr_system -f database/schema.sql

# Method 2: Using pgAdmin
# Open database/schema.sql in pgAdmin Query Tool and execute
```

This will create:
- `users` table
- `attendance` table
- `leave_requests` table
- `time_corrections` table
- Sample data with default users

### 6. Start the Server

#### Development Mode (with auto-restart):

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

You should see:

```
🚀 Server running on http://localhost:5000
📊 Environment: development
🔗 Frontend URL: http://localhost:5173
✅ Connected to PostgreSQL database
```

### 7. Test the API

Open your browser or Postman and visit:

```
http://localhost:5000/health
```

You should see:

```json
{
  "status": "ok",
  "message": "HR System API is running",
  "timestamp": "2025-10-27T12:00:00.000Z"
}
```

---

## Default Login Credentials

The database comes with pre-created users:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | admin |
| manager@company.com | manager123 | manager |
| employee@company.com | employee123 | employee |
| john@company.com | john123 | employee |
| sarah@company.com | sarah123 | manager |

---

## Testing the API with Postman/Insomnia

### 1. Login Request

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "employee@company.com",
  "password": "employee123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "name": "Employee User",
    "email": "employee@company.com",
    "role": "employee"
  }
}
```

### 2. Get Attendance (Protected Route)

```
GET http://localhost:5000/api/attendance
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Check In

```
POST http://localhost:5000/api/attendance/checkin
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Folder Structure

```
backend/
├── config/
│   └── database.js       # Database connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   └── auth.js          # JWT verification
├── routes/
│   ├── auth.js          # /api/auth routes
│   ├── attendance.js    # /api/attendance routes
│   ├── leaves.js        # /api/leaves routes
│   ├── users.js         # /api/users routes
│   └── ...
├── database/
│   └── schema.sql       # Database schema
├── .env                 # Environment variables (DO NOT COMMIT!)
├── .env.example         # Example env file
├── server.js            # Main entry point
└── package.json         # Dependencies
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Solution:**
- Make sure PostgreSQL is running
- Check your `.env` file has correct credentials
- Verify database exists: `psql -U postgres -l`

### Issue 2: "Port 5000 already in use"

**Solution:**
Change port in `.env`:
```env
PORT=5001
```

### Issue 3: "JWT_SECRET is not defined"

**Solution:**
Make sure `.env` file exists and has `JWT_SECRET` defined

### Issue 4: "Module not found"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Database Commands (Useful)

```bash
# Connect to database
psql -U postgres -d hr_system

# List all tables
\dt

# View table structure
\d users

# View all users
SELECT * FROM users;

# View all attendance records
SELECT * FROM attendance;

# Delete all records (reset)
TRUNCATE attendance, leave_requests, time_corrections RESTART IDENTITY CASCADE;

# Exit
\q
```

---

## Next Steps

1. ✅ Backend is running
2. ✅ Database is setup
3. ➡️ Update frontend to use this API (see FRONTEND_INTEGRATION.md)
4. ➡️ Deploy to production (see DEPLOYMENT_GUIDE.md)

---

## Security Notes

**IMPORTANT FOR PRODUCTION:**

1. Change `JWT_SECRET` to a strong random string
2. Use HTTPS/SSL certificates
3. Add rate limiting
4. Implement input validation
5. Setup CORS properly
6. Use environment-specific .env files
7. NEVER commit .env file to Git

---

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify PostgreSQL is running
3. Check `.env` file configuration
4. Review the logs

**Need help?** Let me know what error you're seeing!
