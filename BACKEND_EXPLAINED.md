# How Backend Works & How to Build One

## 🎓 What is a Backend?

Think of your application like a restaurant:

- **Frontend (React)** = The dining area & menu (what customers see)
- **Backend (API Server)** = The kitchen (where food is prepared)
- **Database** = The storage room (where ingredients are kept)

### Current Situation (No Backend):
```
User Browser
    ↓
[React App]
    ↓
localStorage (browser storage)
```
**Problem:** Data only exists in YOUR browser. No sharing, no security, no persistence.

### With Backend:
```
User Browser          User Phone          User Computer
    ↓                     ↓                     ↓
[React App]  ←→  [Backend API Server]  ←→  [Database]
                        ↓
                  (PostgreSQL)
```
**Solution:** Data stored on server, accessible from anywhere!

---

## 🏗️ Backend Architecture Explained

### 1. **Client (Frontend) - React App**
- What the user sees and interacts with
- Makes requests to the backend
- Displays data received from backend

### 2. **Server (Backend) - Node.js/Express**
- Receives requests from frontend
- Processes business logic
- Talks to database
- Sends responses back to frontend

### 3. **Database - PostgreSQL**
- Stores all data permanently
- Users, attendance, leaves, etc.

---

## 🔄 How They Communicate

### Example: User Login

**Step 1: User clicks "Login" button**
```javascript
// Frontend (React)
const handleLogin = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'employee@company.com',
      password: 'employee123'
    })
  })

  const data = await response.json()
  console.log(data) // { token: "abc123...", user: {...} }
}
```

**Step 2: Request travels to backend**
```
Frontend                           Backend
   |                                  |
   |  POST /api/auth/login           |
   |  { email, password } ---------> |
   |                                  |
   |                           [Express Server]
   |                                  |
   |                           Check database
   |                                  ↓
   |                           [PostgreSQL]
   |                                  |
   |  { token, user } <-------------- |
   |                                  |
Browser                            Server
```

**Step 3: Backend processes request**
```javascript
// Backend (Express)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  // 1. Find user in database
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email])

  // 2. Check password
  const isValid = await bcrypt.compare(password, user.password_hash)

  if (isValid) {
    // 3. Create JWT token
    const token = jwt.sign({ userId: user.id }, 'secret-key')

    // 4. Send response back to frontend
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})
```

**Step 4: Frontend receives response**
```javascript
// Frontend stores token and user data
localStorage.setItem('token', data.token)
localStorage.setItem('user', JSON.stringify(data.user))

// Redirect to dashboard
navigate('/dashboard')
```

---

## 📡 HTTP Methods Explained

Backend APIs use different "methods" for different actions:

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Read/Fetch data | Get all employees |
| **POST** | Create new data | Add new user |
| **PUT** | Update existing data | Update user profile |
| **DELETE** | Delete data | Remove user |

### Examples:

```javascript
// GET - Fetch all employees
GET http://localhost:5000/api/employees

// POST - Create new employee
POST http://localhost:5000/api/employees
Body: { name: "John", email: "john@company.com" }

// PUT - Update employee
PUT http://localhost:5000/api/employees/123
Body: { name: "John Updated" }

// DELETE - Remove employee
DELETE http://localhost:5000/api/employees/123
```

---

## 🔐 Authentication Flow

### Without Backend (Current):
```javascript
// Login.jsx - Frontend only
const users = [
  { email: 'admin@company.com', password: 'admin123' }
]

const user = users.find(u => u.email === email && u.password === password)
// ❌ Password in plain text!
// ❌ Anyone can see the code!
```

### With Backend (Secure):
```javascript
// Frontend - Sends credentials
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// Backend - Checks securely
const user = await db.query('SELECT * FROM users WHERE email = $1')
const isValid = await bcrypt.compare(password, user.password_hash)
// ✅ Password hashed!
// ✅ Server-side validation!

// Returns JWT token
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET)
return { token }
```

**JWT Token** = Like a VIP wristband at a concert
- Given after you prove who you are (login)
- Show it for future requests
- Server verifies it's real
- Expires after some time

---

## 🗄️ Database vs localStorage

### localStorage (Current):
```javascript
// Stored in browser
localStorage.setItem('users', JSON.stringify(users))

// ❌ Only on YOUR browser
// ❌ Lost when you clear cache
// ❌ Can't share between devices
// ❌ Anyone can edit using browser console
```

### Database (Production):
```sql
-- Stored on server
INSERT INTO users (name, email, password_hash, role)
VALUES ('John Doe', 'john@company.com', '$2b$10$...', 'employee');

-- ✅ Accessible from anywhere
-- ✅ Permanent storage
-- ✅ Secure server-side
-- ✅ Can't be edited by users
```

---

## 🛠️ Building the Backend - Tech Stack

### We'll use:
1. **Node.js** - JavaScript runtime (runs JS on server)
2. **Express** - Web framework (handles routes/requests)
3. **PostgreSQL** - Database (stores data)
4. **bcrypt** - Password hashing (security)
5. **jsonwebtoken** - JWT tokens (authentication)
6. **dotenv** - Environment variables (configuration)

### Why Node.js?
- Same language as frontend (JavaScript)
- Large community
- Many packages available
- Fast and efficient

---

## 📁 Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # Database connection
│   ├── controllers/
│   │   ├── authController.js    # Login/logout logic
│   │   ├── userController.js    # User CRUD
│   │   ├── attendanceController.js
│   │   └── leaveController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── validation.js    # Input validation
│   ├── models/
│   │   ├── User.js          # User database model
│   │   ├── Attendance.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js          # /api/auth routes
│   │   ├── users.js         # /api/users routes
│   │   ├── attendance.js
│   │   └── leaves.js
│   └── server.js            # Main entry point
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md
```

---

## 🔄 Request Flow Example

### User clocks in for work:

**1. Frontend (React) sends request:**
```javascript
// EmployeeDashboard.jsx
const handleLogin = async () => {
  const response = await fetch('http://localhost:5000/api/attendance/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // JWT token
    },
    body: JSON.stringify({
      userId: user.id,
      loginTime: new Date()
    })
  })

  const data = await response.json()
  console.log(data) // { success: true, attendance: {...} }
}
```

**2. Request hits backend route:**
```javascript
// routes/attendance.js
router.post('/checkin', authenticateToken, attendanceController.checkIn)
```

**3. Middleware verifies token:**
```javascript
// middleware/auth.js
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next() // Continue to controller
  })
}
```

**4. Controller processes request:**
```javascript
// controllers/attendanceController.js
exports.checkIn = async (req, res) => {
  try {
    const { loginTime } = req.body
    const userId = req.user.userId

    // Insert into database
    const result = await db.query(
      'INSERT INTO attendance (user_id, login_time) VALUES ($1, $2) RETURNING *',
      [userId, loginTime]
    )

    res.json({ success: true, attendance: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

**5. Database stores data:**
```sql
attendance table:
+----+---------+---------------------+
| id | user_id | login_time          |
+----+---------+---------------------+
| 1  | 5       | 2025-10-27 09:00:00 |
+----+---------+---------------------+
```

**6. Response sent back to frontend:**
```javascript
// Frontend receives response
{
  "success": true,
  "attendance": {
    "id": 1,
    "user_id": 5,
    "login_time": "2025-10-27T09:00:00.000Z"
  }
}
```

---

## 💾 Database Schema

### Users Table:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance Table:
```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  login_time TIMESTAMP NOT NULL,
  logout_time TIMESTAMP,
  work_hours DECIMAL(5,2),
  break_time DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Leave Requests Table:
```sql
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  submitted_date TIMESTAMP DEFAULT NOW(),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_date TIMESTAMP
);
```

---

## 🔒 Security Explained

### 1. Password Hashing:
```javascript
// When user signs up
const plainPassword = 'employee123'
const hashedPassword = await bcrypt.hash(plainPassword, 10)
// Stored: "$2b$10$N9qo8uLO..."

// When user logs in
const isValid = await bcrypt.compare('employee123', hashedPassword)
// true or false
```

**Why?** Even if someone steals the database, they can't see actual passwords!

### 2. JWT Tokens:
```javascript
// Create token (after login)
const token = jwt.sign(
  { userId: user.id, role: user.role },
  'secret-key',
  { expiresIn: '24h' }
)

// Token looks like: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Verify token (on every request)
const decoded = jwt.verify(token, 'secret-key')
// { userId: 5, role: 'employee' }
```

### 3. Environment Variables:
```bash
# .env file (NEVER commit to GitHub!)
DATABASE_URL=postgresql://user:password@localhost:5432/hrdb
JWT_SECRET=super-secret-key-change-this-in-production
PORT=5000
NODE_ENV=production
```

```javascript
// Access in code
const secret = process.env.JWT_SECRET
const port = process.env.PORT
```

---

## 🚀 How Data Flows

### Old Way (localStorage only):
```
User → React → localStorage in Browser
                ↓
           Data stuck here!
```

### New Way (With Backend):
```
User 1 (Browser) ────┐
                     │
User 2 (Phone)   ────┼───→ Backend API ←→ Database
                     │         ↑
User 3 (Laptop)  ────┘         │
                               │
                    All users share same data!
```

---

## 🎯 Next Steps

I'll create the actual backend code for you in the next response, showing:
1. Complete working backend server
2. Database setup
3. How to connect your React frontend
4. Step-by-step setup instructions

**Ready to build it?**
