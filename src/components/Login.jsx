import { useState, useEffect } from 'react'
import './Login.css'

// Predefined users - in a real app, this would be in a backend database
const defaultUsers = [
  { email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'manager@company.com', password: 'manager123', role: 'manager', name: 'Manager User' },
  { email: 'employee@company.com', password: 'employee123', role: 'employee', name: 'Employee User' },
  { email: 'john@company.com', password: 'john123', role: 'employee', name: 'John Doe' },
  { email: 'sarah@company.com', password: 'sarah123', role: 'manager', name: 'Sarah Smith' }
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Initialize users in localStorage on first load
  useEffect(() => {
    const existingUsers = localStorage.getItem('systemUsers')
    if (!existingUsers) {
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')

    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      onLogin(user.name, user.role)
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>HR System Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@company.com / admin123</p>
          <p>Manager: manager@company.com / manager123</p>
          <p>Employee: employee@company.com / employee123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
