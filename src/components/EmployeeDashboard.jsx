import { useState, useEffect } from 'react'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#16213e] dark:to-[#0f3460] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#006d77] to-[#83c5be] bg-clip-text text-transparent mb-2">
            Employee Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome, {user.username}!
          </p>
        </div>

        <div className="space-y-6">
          {!isLoggedIn && !sessionSummary && (
            <div className="flex justify-center">
              <button
                className="px-8 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          )}

          {isLoggedIn && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#0f3460] rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-[#2a3f5f]">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Time Since Login
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    {getElapsedTime()}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f3460] rounded-xl shadow-lg p-6 border-2 border-[#006d77] dark:border-[#83c5be]">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Work Time
                  </h3>
                  <p className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be]">
                    {getWorkTime()}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f3460] rounded-xl shadow-lg p-6 border-2 border-[#e29578] dark:border-[#ffddd2]">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Total Break Time
                  </h3>
                  <p className="text-3xl font-bold text-[#e29578] dark:text-[#ffddd2]">
                    {getTotalBreakTime()}
                  </p>
                </div>

                {isOnBreak && (
                  <div className="bg-gradient-to-br from-[#e29578] to-[#ffddd2] dark:from-[#e29578]/80 dark:to-[#ffddd2]/80 rounded-xl shadow-lg p-6 border-2 border-[#e29578]">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Current Break
                    </h3>
                    <p className="text-3xl font-bold text-white">
                      {getCurrentBreakTime()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                {!isOnBreak ? (
                  <button
                    className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#e29578] to-[#ffddd2] text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    onClick={handleBreakIn}
                  >
                    Break In
                  </button>
                ) : (
                  <button
                    className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    onClick={handleBreakOut}
                  >
                    Break Out
                  </button>
                )}

                <button
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>

              {isOnBreak && (
                <div className="bg-gradient-to-r from-[#e29578] to-[#ffddd2] text-white text-center py-3 px-6 rounded-xl font-semibold text-lg shadow-lg">
                  Currently on Break
                </div>
              )}
            </>
          )}

          {sessionSummary && (
            <div className="bg-white dark:bg-[#0f3460] rounded-xl shadow-lg p-8 border-2 border-[#006d77] dark:border-[#83c5be]">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Session Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#16213e] rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    Total Work Time:
                  </span>
                  <span className="text-xl font-bold text-[#006d77] dark:text-[#83c5be]">
                    {sessionSummary.totalWorked}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#16213e] rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    Total Break Time:
                  </span>
                  <span className="text-xl font-bold text-[#e29578]">
                    {sessionSummary.totalBreak}
                  </span>
                </div>
              </div>
              <button
                className="w-full px-6 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                onClick={handleLogin}
              >
                Start New Session
              </button>
            </div>
          )}

          {/* Login History */}
          {loginHistory.length > 0 && (
            <div className="bg-white dark:bg-[#0f3460] rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-[#2a3f5f]">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Recent Login History
              </h3>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-bold rounded-t-lg">
                    <div>Date</div>
                    <div>Login Time</div>
                    <div>Logout Time</div>
                    <div>Work Hours</div>
                    <div>Break Time</div>
                  </div>
                  {loginHistory.map((session) => (
                    <div
                      key={session.id}
                      className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-[#2a3f5f] hover:bg-gray-50 dark:hover:bg-[#16213e] transition-colors"
                    >
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {formatDate(session.date)}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDateTime(session.loginTime)}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDateTime(session.logoutTime)}
                      </div>
                      <div className="font-semibold text-[#006d77] dark:text-[#83c5be]">
                        {session.totalWorked}
                      </div>
                      <div className="font-semibold text-[#e29578]">
                        {session.totalBreak}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
