# Frontend Integration Guide

## How to Connect React Frontend to Backend API

This guide shows you how to update your React app to use the backend API instead of localStorage.

---

## Step 1: Create API Service Layer

Create a new file `src/services/api.js`:

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: async () => {
    return apiCall('/attendance/checkin', {
      method: 'POST'
    });
  },

  checkOut: async () => {
    return apiCall('/attendance/checkout', {
      method: 'PUT'
    });
  },

  startBreak: async () => {
    return apiCall('/attendance/break-start', {
      method: 'PUT'
    });
  },

  endBreak: async () => {
    return apiCall('/attendance/break-end', {
      method: 'PUT'
    });
  },

  getHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/attendance${query ? '?' + query : ''}`);
  },

  getActive: async () => {
    return apiCall('/attendance/active');
  }
};

// Leave APIs
export const leaveAPI = {
  getAll: async () => {
    return apiCall('/leaves');
  },

  submit: async (leaveData) => {
    return apiCall('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  },

  updateStatus: async (id, status, rejectionReason = '') => {
    return apiCall(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason })
    });
  }
};

// User APIs
export const userAPI = {
  getAll: async () => {
    return apiCall('/users');
  },

  create: async (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  update: async (id, userData) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  delete: async (id) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Report APIs
export const reportAPI = {
  getAttendance: async () => {
    return apiCall('/reports/attendance');
  },

  getLeaves: async () => {
    return apiCall('/reports/leaves');
  }
};
```

---

## Step 2: Update Environment Variables

Create `.env` file in your frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 3: Update Login Component

**Before (localStorage only):**

```javascript
// src/components/Login.jsx (OLD)
const handleSubmit = (e) => {
  e.preventDefault();
  const users = JSON.parse(localStorage.getItem('systemUsers') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    onLogin(user.name, user.role);
  } else {
    setError('Invalid credentials');
  }
};
```

**After (With API):**

```javascript
// src/components/Login.jsx (NEW)
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await authAPI.login(email, password);

    // Save token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Call parent component's login handler
    onLogin(response.user.name, response.user.role);
  } catch (error) {
    setError(error.message || 'Invalid credentials');
  } finally {
    setLoading(false);
  }
};
```

---

## Step 4: Update Employee Dashboard

**Before:**

```javascript
// EmployeeDashboard.jsx (OLD)
const handleLogin = () => {
  setIsLoggedIn(true);
  setLoginTime(Date.now());
  // Save to localStorage...
};
```

**After:**

```javascript
// EmployeeDashboard.jsx (NEW)
import { attendanceAPI } from '../services/api';

const handleLogin = async () => {
  try {
    setLoading(true);
    const response = await attendanceAPI.checkIn();

    setIsLoggedIn(true);
    setLoginTime(response.attendance.login_time);

    alert('Checked in successfully!');
  } catch (error) {
    alert(error.message || 'Failed to check in');
  } finally {
    setLoading(false);
  }
};

const handleLogout = async () => {
  try {
    setLoading(true);
    const response = await attendanceAPI.checkOut();

    setIsLoggedIn(false);
    setSessionSummary(response.attendance);

    alert('Checked out successfully!');
  } catch (error) {
    alert(error.message || 'Failed to check out');
  } finally {
    setLoading(false);
  }
};

const handleBreakIn = async () => {
  try {
    await attendanceAPI.startBreak();
    setIsOnBreak(true);
    setBreakStartTime(Date.now());
  } catch (error) {
    alert(error.message || 'Failed to start break');
  }
};

const handleBreakOut = async () => {
  try {
    await attendanceAPI.endBreak();
    setIsOnBreak(false);
    setBreakStartTime(null);
  } catch (error) {
    alert(error.message || 'Failed to end break');
  }
};
```

---

## Step 5: Update User Management (Admin)

**Before:**

```javascript
// UserManagement.jsx (OLD)
const handleAddUser = () => {
  const users = JSON.parse(localStorage.getItem('systemUsers') || '[]');
  users.push(newUser);
  localStorage.setItem('systemUsers', JSON.stringify(users));
};
```

**After:**

```javascript
// UserManagement.jsx (NEW)
import { userAPI } from '../services/api';

const handleAddUser = async () => {
  try {
    setLoading(true);
    const response = await userAPI.create(formData);

    // Reload users list
    loadUsers();

    alert('User created successfully!');
    setShowModal(false);
  } catch (error) {
    alert(error.message || 'Failed to create user');
  } finally {
    setLoading(false);
  }
};

const loadUsers = async () => {
  try {
    const response = await userAPI.getAll();
    setUsers(response.users);
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const handleDeleteUser = async (userId) => {
  if (!confirm('Are you sure?')) return;

  try {
    await userAPI.delete(userId);
    loadUsers(); // Reload list
    alert('User deleted successfully!');
  } catch (error) {
    alert(error.message || 'Failed to delete user');
  }
};
```

---

## Step 6: Add Loading States

Add loading states to improve UX:

```javascript
const [loading, setLoading] = useState(false);

// In your JSX
{loading ? (
  <div className="loading">Loading...</div>
) : (
  <button onClick={handleSubmit}>Submit</button>
)}
```

---

## Step 7: Error Handling

Create a global error handler:

```javascript
// src/utils/errorHandler.js
export const handleAPIError = (error) => {
  if (error.message === 'Invalid or expired token') {
    // Token expired, logout user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Show user-friendly error
  return error.message || 'Something went wrong. Please try again.';
};
```

---

## Complete Migration Checklist

### Authentication:
- [ ] Update Login.jsx to use authAPI.login()
- [ ] Add token storage
- [ ] Handle token expiration

### Attendance:
- [ ] Update check-in to use attendanceAPI.checkIn()
- [ ] Update check-out to use attendanceAPI.checkOut()
- [ ] Update break management
- [ ] Load attendance history from API

### Leave Management:
- [ ] Submit leave requests via API
- [ ] Load leave requests from API
- [ ] Approve/reject via API

### User Management (Admin):
- [ ] Load users from API
- [ ] Create users via API
- [ ] Update users via API
- [ ] Delete users via API

### Reports:
- [ ] Load attendance reports from API
- [ ] Load leave reports from API

---

## Testing the Integration

### 1. Start Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### 2. Test Login Flow

1. Open http://localhost:5173
2. Login with: `employee@company.com` / `employee123`
3. Check browser Network tab - you should see API calls!

### 3. Check for Errors

Open browser console and look for:
- ✅ API calls successful (200 status)
- ❌ CORS errors (if any, check backend CORS settings)
- ❌ Token errors (check token storage)

---

## Common Issues

### Issue 1: CORS Error

**Error:** "Access to fetch has been blocked by CORS policy"

**Solution:** Make sure backend has CORS enabled:

```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: Token Not Sent

**Error:** "Access token required"

**Solution:** Make sure you're sending token in headers:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue 3: Data Not Loading

**Solution:**
1. Check if backend is running (http://localhost:5000/health)
2. Check browser console for errors
3. Verify API URL in .env file

---

## Benefits of Using Backend API

✅ **Data Persistence** - Data survives browser refresh
✅ **Multi-device Access** - Same data on phone, laptop, etc.
✅ **Security** - Passwords hashed, server-side validation
✅ **Team Collaboration** - Multiple users share same data
✅ **Scalability** - Can handle many users
✅ **Backups** - Database can be backed up

---

## Next Steps

1. Migrate one component at a time
2. Test thoroughly after each migration
3. Keep old localStorage code commented until everything works
4. Deploy both frontend and backend together

**Need help with a specific component? Let me know!**
