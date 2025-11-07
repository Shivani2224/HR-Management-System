import { useState, useEffect } from 'react'
import './EmployeeDashboard.css'

function EmployeeDashboard({ user }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginTime, setLoginTime] = useState(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState(null)
  const [totalBreakTime, setTotalBreakTime] = useState(0)
  const [sessionSummary, setSessionSummary] = useState(null)
  const [loginHistory, setLoginHistory] = useState([])

  // Load active session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(`activeSession_${user.username}`)
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setIsLoggedIn(session.isLoggedIn)
      setLoginTime(session.loginTime)
      setIsOnBreak(session.isOnBreak)
      setBreakStartTime(session.breakStartTime)
      setTotalBreakTime(session.totalBreakTime)
    }
    loadLoginHistory()
  }, [user.username])

  // Load login history
  const loadLoginHistory = () => {
    const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
    // Get last 10 sessions
    setLoginHistory(attendanceHistory.slice(0, 10))
  }

  // Save active session to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      const sessionData = {
        isLoggedIn,
        loginTime,
        isOnBreak,
        breakStartTime,
        totalBreakTime
      }
      localStorage.setItem(`activeSession_${user.username}`, JSON.stringify(sessionData))
    } else {
      // Clear session when logged out
      localStorage.removeItem(`activeSession_${user.username}`)
    }
  }, [isLoggedIn, loginTime, isOnBreak, breakStartTime, totalBreakTime, user.username])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-logout at end of day (midnight)
  useEffect(() => {
    if (!isLoggedIn) return

    const checkEndOfDay = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      // Auto-logout at 11:59 PM
      if (hours === 23 && minutes === 59) {
        alert('End of day reached. Automatically logging you out.')
        handleLogout()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkEndOfDay)
  }, [isLoggedIn])

  const handleLogin = () => {
    setIsLoggedIn(true)
    setLoginTime(Date.now())
    setTotalBreakTime(0)
    setSessionSummary(null)
  }

  const handleLogout = () => {
    if (isLoggedIn) {
      // Auto break-out if still on break
      let finalBreakTime = totalBreakTime
      if (isOnBreak && breakStartTime) {
        const currentBreakDuration = Date.now() - breakStartTime
        finalBreakTime = totalBreakTime + currentBreakDuration
        alert('You were still on break. Automatically ending your break before logout.')
      }

      const logoutTime = Date.now()
      const totalWorkedMs = logoutTime - loginTime - finalBreakTime
      const totalWorkedHours = Math.floor(totalWorkedMs / (1000 * 60 * 60))
      const totalWorkedMinutes = Math.floor((totalWorkedMs % (1000 * 60 * 60)) / (1000 * 60))
      const totalWorkedSeconds = Math.floor((totalWorkedMs % (1000 * 60)) / 1000)

      const totalBreakHours = Math.floor(finalBreakTime / (1000 * 60 * 60))
      const totalBreakMinutes = Math.floor((finalBreakTime % (1000 * 60 * 60)) / (1000 * 60))
      const totalBreakSeconds = Math.floor((finalBreakTime % (1000 * 60)) / 1000)

      const sessionData = {
        id: Date.now(),
        username: user.username,
        userRole: user.role,
        loginTime: loginTime,
        logoutTime: logoutTime,
        totalWorkedMs: totalWorkedMs,
        totalBreakMs: finalBreakTime,
        totalWorked: `${totalWorkedHours}h ${totalWorkedMinutes}m ${totalWorkedSeconds}s`,
        totalBreak: `${totalBreakHours}h ${totalBreakMinutes}m ${totalBreakSeconds}s`,
        date: new Date(loginTime).toISOString().split('T')[0]
      }

      // Save to attendance history
      const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${user.username}`) || '[]')
      attendanceHistory.unshift(sessionData)
      localStorage.setItem(`attendance_${user.username}`, JSON.stringify(attendanceHistory))

      setSessionSummary({
        totalWorked: sessionData.totalWorked,
        totalBreak: sessionData.totalBreak
      })

      setIsLoggedIn(false)
      setLoginTime(null)
      setIsOnBreak(false)
      setBreakStartTime(null)

      // Reload login history
      loadLoginHistory()
    }
  }

  const handleBreakIn = () => {
    setIsOnBreak(true)
    setBreakStartTime(Date.now())
  }

  const handleBreakOut = () => {
    if (isOnBreak && breakStartTime) {
      const breakDuration = Date.now() - breakStartTime
      setTotalBreakTime(prev => prev + breakDuration)
      setIsOnBreak(false)
      setBreakStartTime(null)
    }
  }

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const getElapsedTime = () => {
    if (!loginTime) return '0h 0m 0s'
    return formatTime(currentTime - loginTime)
  }

  const getCurrentBreakTime = () => {
    if (!isOnBreak || !breakStartTime) return '0h 0m 0s'
    return formatTime(currentTime - breakStartTime)
  }

  const getTotalBreakTime = () => {
    let total = totalBreakTime
    if (isOnBreak && breakStartTime) {
      total += (currentTime - breakStartTime)
    }
    return formatTime(total)
  }

  const getWorkTime = () => {
    if (!loginTime) return '0h 0m 0s'
    let totalBreak = totalBreakTime
    if (isOnBreak && breakStartTime) {
      totalBreak += (currentTime - breakStartTime)
    }
    return formatTime(currentTime - loginTime - totalBreak)
  }

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h2>Employee Dashboard</h2>
        <p>Welcome, {user.username}!</p>
      </div>

      <div className="dashboard-content">
        {!isLoggedIn && !sessionSummary && (
          <div className="action-section">
            <button className="btn btn-login" onClick={handleLogin}>
              Login
            </button>
          </div>
        )}

        {isLoggedIn && (
          <>
            <div className="time-display">
              <div className="time-card">
                <h3>Time Since Login</h3>
                <p className="time-value">{getElapsedTime()}</p>
              </div>

              <div className="time-card">
                <h3>Work Time</h3>
                <p className="time-value work">{getWorkTime()}</p>
              </div>

              <div className="time-card">
                <h3>Total Break Time</h3>
                <p className="time-value break">{getTotalBreakTime()}</p>
              </div>

              {isOnBreak && (
                <div className="time-card current-break">
                  <h3>Current Break</h3>
                  <p className="time-value">{getCurrentBreakTime()}</p>
                </div>
              )}
            </div>

            <div className="action-section">
              {!isOnBreak ? (
                <button className="btn btn-break-in" onClick={handleBreakIn}>
                  Break In
                </button>
              ) : (
                <button className="btn btn-break-out" onClick={handleBreakOut}>
                  Break Out
                </button>
              )}

              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>

            {isOnBreak && (
              <div className="status-badge on-break">
                Currently on Break
              </div>
            )}
          </>
        )}

        {sessionSummary && (
          <div className="session-summary">
            <h3>Session Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span className="label">Total Work Time:</span>
                <span className="value">{sessionSummary.totalWorked}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Break Time:</span>
                <span className="value">{sessionSummary.totalBreak}</span>
              </div>
            </div>
            <button className="btn btn-login" onClick={handleLogin}>
              Start New Session
            </button>
          </div>
        )}

        {/* Login History */}
        {loginHistory.length > 0 && (
          <div className="login-history">
            <h3>Recent Login History</h3>
            <div className="history-table">
              <div className="table-header">
                <div className="col">Date</div>
                <div className="col">Login Time</div>
                <div className="col">Logout Time</div>
                <div className="col">Work Hours</div>
                <div className="col">Break Time</div>
              </div>
              {loginHistory.map((session) => (
                <div key={session.id} className="table-row">
                  <div className="col date">{formatDate(session.date)}</div>
                  <div className="col">{formatDateTime(session.loginTime)}</div>
                  <div className="col">{formatDateTime(session.logoutTime)}</div>
                  <div className="col work-time">{session.totalWorked}</div>
                  <div className="col break-time">{session.totalBreak}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeDashboard
