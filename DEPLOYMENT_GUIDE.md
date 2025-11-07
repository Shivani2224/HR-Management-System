# HR System - Deployment Guide

## 🚀 Quick Deployment (Static Hosting - Demo/Testing Only)

### Option 1: Vercel (Recommended for Quick Deploy)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. Follow the prompts and your app will be live!

**Pros:** Free, fast, automatic HTTPS, easy setup
**Cons:** Data stored in browser localStorage (lost on clear), not suitable for production

---

### Option 2: Netlify

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Pros:** Free tier, drag-and-drop option, automatic HTTPS
**Cons:** Same localStorage limitation

---

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/hr-system",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js:**
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/hr-system/'  // Your repo name
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## ⚠️ CRITICAL: Production Limitations

### Current Limitations:

❌ **No Backend** - All data stored in browser localStorage
❌ **No Database** - Data lost when browser cache is cleared
❌ **No Security** - Passwords stored in plain text
❌ **No API** - No server-side logic
❌ **Single Device** - Data doesn't sync between devices/browsers
❌ **No Backups** - Data can be lost permanently

### What This Means:

**Current app is DEMO/PROTOTYPE ONLY** - Not suitable for real production use!

---

## 🏗️ Production-Ready Deployment (Required for Real Use)

To make this production-ready, you need:

### 1. Backend API

**Create a backend server using:**
- **Node.js + Express** (JavaScript)
- **Django/Flask** (Python)
- **Spring Boot** (Java)
- **Laravel** (PHP)

**What the backend needs:**
```
POST   /api/auth/login          - User authentication
POST   /api/auth/logout         - User logout
GET    /api/users               - Get all users (admin/manager)
POST   /api/users               - Create user (admin)
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user

GET    /api/attendance          - Get attendance records
POST   /api/attendance/checkin  - Clock in
POST   /api/attendance/checkout - Clock out
POST   /api/attendance/break-in - Start break
POST   /api/attendance/break-out- End break

GET    /api/leaves              - Get leave requests
POST   /api/leaves              - Submit leave request
PUT    /api/leaves/:id/approve  - Approve leave
PUT    /api/leaves/:id/reject   - Reject leave

GET    /api/time-corrections    - Get correction requests
POST   /api/time-corrections    - Submit correction
PUT    /api/time-corrections/:id/approve - Approve correction
PUT    /api/time-corrections/:id/reject  - Reject correction

GET    /api/reports/attendance  - Attendance reports
GET    /api/reports/leaves      - Leave reports
GET    /api/payslips           - Get payslips
GET    /api/profile            - Get user profile
PUT    /api/profile            - Update profile
```

### 2. Database

**Choose a database:**
- **PostgreSQL** (Recommended for production)
- **MySQL**
- **MongoDB**
- **SQLite** (For small deployments)

**Database Schema Needed:**
```sql
-- Users table
users (id, name, email, password_hash, role, created_at)

-- Attendance table
attendance (id, user_id, login_time, logout_time, work_hours, break_time, date)

-- Leave requests table
leave_requests (id, user_id, type, start_date, end_date, days, reason, status, submitted_date)

-- Time corrections table
time_corrections (id, user_id, attendance_id, old_login, old_logout, new_login, new_logout, reason, status)

-- Payslips table
payslips (id, user_id, month, year, basic, hra, transport, medical, bonus, tax, pf, insurance, net_salary)

-- Settings table
settings (id, key, value)

-- Holidays table
holidays (id, name, date)
```

### 3. Security Improvements

**MUST IMPLEMENT:**

✅ **Password Hashing** (bcrypt, argon2)
```javascript
// Example with bcrypt
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

✅ **JWT Authentication**
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
```

✅ **HTTPS/SSL Certificate** (Let's Encrypt - Free)

✅ **Environment Variables**
```env
DATABASE_URL=postgresql://user:pass@host:5432/hrdb
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=production
```

✅ **Input Validation & Sanitization**

✅ **CORS Configuration**
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

✅ **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);
```

---

## 🌐 Full Stack Deployment Options

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

**Frontend:**
- Build React app: `npm run build`
- Serve with Nginx/Apache

**Backend:**
- Deploy Node.js/Python/etc server
- Setup PM2 for Node.js process management

**Database:**
- Install PostgreSQL/MySQL
- Setup backups

**Estimated Cost:** $5-20/month

---

### Option 2: Platform-as-a-Service

**Heroku (Simple but not free anymore)**
- Frontend + Backend together
- Heroku Postgres add-on
- Easy deployment with Git

**Railway.app (Modern alternative)**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render.com (Great free tier)**
- Separate frontend and backend
- Free PostgreSQL database
- Auto-deploys from GitHub

**Estimated Cost:** Free tier available, $7-25/month for production

---

### Option 3: Serverless (AWS, Google Cloud, Azure)

**Frontend:** S3 + CloudFront (AWS) or Vercel
**Backend:** AWS Lambda + API Gateway
**Database:** RDS or DynamoDB

**Pros:** Scales automatically, pay for what you use
**Cons:** More complex setup

**Estimated Cost:** $10-50/month depending on usage

---

## 📝 Pre-Deployment Checklist

### Code Changes Needed:

- [ ] Replace all `localStorage` calls with API calls
- [ ] Implement proper authentication with JWT
- [ ] Add loading states for API calls
- [ ] Add error handling for network failures
- [ ] Implement proper form validation
- [ ] Add confirmation dialogs for destructive actions
- [ ] Remove hardcoded credentials
- [ ] Add environment variable configuration
- [ ] Implement session timeout
- [ ] Add CSRF protection

### Create `.env` file:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=HR System
```

### Update frontend to use API:
```javascript
// Example: Replace localStorage with API calls
// Before:
const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')

// After:
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const users = await response.json()
```

---

## 🔧 Backend Setup Example (Node.js + Express)

### 1. Create backend folder:
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken pg
```

### 2. Basic server structure:
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/login', async (req, res) => {
  // Authentication logic
});

app.get('/api/users', authenticateToken, async (req, res) => {
  // Get users logic
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🚦 Simple Production Deployment Steps

### For Quick Production Deploy (Recommended Path):

1. **Choose Render.com (Free tier + Easy setup)**

2. **Create two services:**
   - **Frontend (Static Site):**
     - Connect GitHub repo
     - Build command: `npm run build`
     - Publish directory: `dist`

   - **Backend (Web Service):**
     - Create Node.js backend
     - Auto-deploy from GitHub

3. **Add PostgreSQL database:**
   - Create from Render dashboard
   - Free tier available

4. **Update frontend environment variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

5. **Deploy!**

---

## 📊 Recommended Tech Stack for Production

```
Frontend: React + Vite (Current)
Backend:  Node.js + Express + Sequelize/Prisma
Database: PostgreSQL
Hosting:  Render.com or Railway.app
Storage:  Cloudinary (for files/images)
Email:    SendGrid (for notifications)
```

---

## 💰 Cost Estimates

### Free Tier (Testing/Small Teams):
- Render.com Free tier
- PostgreSQL Free tier (limited)
- **Total: $0/month** (with limitations)

### Production (Small Company):
- Render.com Web Service: $7/month
- PostgreSQL: $7/month
- Domain: $12/year
- **Total: ~$15/month**

### Production (Medium Company):
- VPS (DigitalOcean): $12/month
- Managed Database: $15/month
- Domain + SSL: $12/year
- **Total: ~$28/month**

---

## 🎯 Next Steps

### For Demo/Portfolio:
1. Deploy current app to Vercel/Netlify as-is
2. Add disclaimer: "Demo app - data stored locally"

### For Production Use:
1. Build backend API (1-2 weeks)
2. Setup PostgreSQL database
3. Migrate localStorage to API calls (1 week)
4. Implement authentication & security (1 week)
5. Deploy to production hosting
6. Setup monitoring & backups

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [JWT Authentication Guide](https://jwt.io/introduction)

---

## 🆘 Support & Maintenance

After deployment, you'll need:
- Regular backups (daily recommended)
- Security updates
- Monitoring (error tracking, uptime)
- SSL certificate renewal (automatic with Let's Encrypt)
- Database maintenance

---

**Questions? Need help with production deployment? Let me know which path you want to take!**
