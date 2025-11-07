# HR System Backend API

A complete backend API for the HR Management System built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database (see SETUP.md)
# Create PostgreSQL database named 'hr_system'

# 3. Copy environment file
copy .env.example .env
# Edit .env with your database credentials

# 4. Run database schema
psql -U postgres -d hr_system -f database/schema.sql

# 5. Start server
npm run dev
```

Server will run on: http://localhost:5000

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js              # PostgreSQL connection
├── controllers/
│   └── authController.js        # Authentication logic
├── middleware/
│   └── auth.js                  # JWT verification
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── users.js                 # User management
│   ├── attendance.js            # Time tracking
│   ├── leaves.js                # Leave requests
│   ├── timeCorrections.js       # Time corrections
│   ├── reports.js               # Analytics reports
│   └── profile.js               # User profile
├── database/
│   └── schema.sql               # Database schema
├── .env                         # Environment variables (create this!)
├── .env.example                 # Example environment file
├── server.js                    # Main entry point
├── package.json                 # Dependencies
├── SETUP.md                     # Detailed setup guide
└── README.md                    # This file
```

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/login              Login user
POST   /api/auth/register           Register new user (Admin only)
PUT    /api/auth/change-password    Change password
GET    /api/auth/verify             Verify token
```

### Users (Admin Only)
```
GET    /api/users                   Get all users
GET    /api/users/:id               Get single user
POST   /api/users                   Create user
PUT    /api/users/:id               Update user
DELETE /api/users/:id               Delete user
```

### Attendance
```
POST   /api/attendance/checkin      Clock in
PUT    /api/attendance/checkout     Clock out
PUT    /api/attendance/break-start  Start break
PUT    /api/attendance/break-end    End break
GET    /api/attendance              Get attendance history
GET    /api/attendance/active       Get active session
```

### Leave Requests
```
GET    /api/leaves                  Get all leaves
POST   /api/leaves                  Submit leave request
PUT    /api/leaves/:id/status       Approve/reject leave
```

### Time Corrections
```
GET    /api/time-corrections        Get all corrections
POST   /api/time-corrections        Submit correction
PUT    /api/time-corrections/:id/status  Approve/reject correction
```

### Reports (Manager/Admin)
```
GET    /api/reports/attendance      Attendance report
GET    /api/reports/leaves          Leave report
```

### Profile
```
GET    /api/profile                 Get user profile
PUT    /api/profile                 Update profile
```

---

## 🗄️ Database Schema

### Tables:
- **users** - User accounts and authentication
- **attendance** - Daily attendance records
- **leave_requests** - Leave/vacation requests
- **time_corrections** - Attendance correction requests

See `database/schema.sql` for complete schema.

---

## 🔒 Authentication

Uses JWT (JSON Web Tokens) for authentication:

1. **Login** - User provides email/password
2. **Token** - Server returns JWT token
3. **Protected Routes** - Client sends token in header:
   ```
   Authorization: Bearer <token>
   ```

Token expires in 24 hours.

---

## 👥 Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | admin |
| manager@company.com | manager123 | manager |
| employee@company.com | employee123 | employee |

---

## 🛠️ Environment Variables

Required variables in `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@company.com","password":"employee123"}'
```

### Check In (requires token)
```bash
curl -X POST http://localhost:5000/api/attendance/checkin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 API Response Format

### Success Response
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@company.com"
  }
}
```

### Error Response
```json
{
  "error": "Invalid credentials"
}
```

---

## 🔧 Development

### Run in Development Mode (auto-restart)
```bash
npm run dev
```

### Run in Production Mode
```bash
npm start
```

---

## 📚 Additional Resources

- **SETUP.md** - Detailed setup instructions
- **BACKEND_EXPLAINED.md** - How backend works
- **FRONTEND_INTEGRATION.md** - Connect React frontend
- **DEPLOYMENT_GUIDE.md** - Deploy to production

---

## 🐛 Troubleshooting

### Can't connect to database
- Check PostgreSQL is running
- Verify credentials in `.env`

### Port already in use
- Change `PORT` in `.env`

### Token errors
- Check `JWT_SECRET` is set in `.env`

See SETUP.md for more troubleshooting tips.

---

## 📦 Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables

---

## 🔐 Security Features

✅ Password hashing with bcrypt
✅ JWT token authentication
✅ Role-based access control
✅ SQL injection protection (parameterized queries)
✅ CORS configuration
✅ Environment variables for secrets

---

## 📖 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net/)

---

**Built with ❤️ for HR Management**
