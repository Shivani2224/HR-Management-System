import { useState, useEffect } from 'react'

function ManagerDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    pendingLeaves: 0,
    pendingTimeCorrections: 0,
    totalLeaveRequests: 0,
    totalAttendanceRecords: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [topEmployees, setTopEmployees] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Get all users - managers only see employees, not other managers
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employees = users.filter(u => u.role === 'employee')

    // Get leave requests (only from employees)
    const leaveRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    const employeeLeaveRequests = leaveRequests.filter(r => r.userRole === 'employee')
    const pendingLeaves = employeeLeaveRequests.filter(r => r.status === 'pending').length

    // Get time correction requests (only from employees)
    const timeCorrectionRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const employeeTimeCorrections = timeCorrectionRequests.filter(r => r.userRole === 'employee')
    const pendingTimeCorrections = employeeTimeCorrections.filter(r => r.status === 'pending').length

    // Count active sessions today
    let activeToday = 0
    const today = new Date().toISOString().split('T')[0]
    employees.forEach(emp => {
      const activeSession = localStorage.getItem(`activeSession_${emp.name}`)
      if (activeSession) {
        const session = JSON.parse(activeSession)
        if (session.isLoggedIn) {
          activeToday++
        }
      }
    })

    // Count total attendance records
    let totalAttendanceRecords = 0
    employees.forEach(emp => {
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')
      totalAttendanceRecords += attendance.length
    })

    setStats({
      totalEmployees: employees.length,
      activeToday,
      pendingLeaves,
      pendingTimeCorrections,
      totalLeaveRequests: employeeLeaveRequests.length,
      totalAttendanceRecords
    })

    // Load recent activity
    loadRecentActivity(employeeLeaveRequests, employeeTimeCorrections)

    // Load top employees by hours
    loadTopEmployees(employees)
  }

  const loadRecentActivity = (leaveRequests, timeCorrectionRequests) => {
    const activities = []

    // Add recent leave requests
    leaveRequests.slice(0, 5).forEach(req => {
      activities.push({
        id: `leave-${req.id}`,
        type: 'leave',
        user: req.username,
        action: `Requested ${req.type} leave`,
        time: req.submittedDate,
        status: req.status
      })
    })

    // Add recent time corrections
    timeCorrectionRequests.slice(0, 5).forEach(req => {
      activities.push({
        id: `time-${req.id}`,
        type: 'timeCorrection',
        user: req.username,
        action: 'Requested time correction',
        time: req.submittedDate,
        status: req.status
      })
    })

    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time))

    setRecentActivity(activities.slice(0, 10))
  }

  const loadTopEmployees = (employees) => {
    const employeeStats = []

    employees.forEach(emp => {
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')

      let totalHours = 0
      attendance.forEach(record => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60) // Convert to hours
      })

      if (attendance.length > 0) {
        employeeStats.push({
          name: emp.name,
          role: emp.role,
          totalHours: totalHours.toFixed(1),
          sessions: attendance.length,
          avgHours: (totalHours / attendance.length).toFixed(1)
        })
      }
    })

    // Sort by total hours
    employeeStats.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours))

    setTopEmployees(employeeStats.slice(0, 5))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-[#ffddd2] dark:bg-[#0a1929] p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user.username}! Here's your team overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-[#006d77] dark:border-[#83c5be]">
          <div className="flex items-center justify-between">
            <div className="text-4xl">👥</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Team Members</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="text-4xl">✅</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activeToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Active Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="text-4xl">⏰</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingLeaves}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Pending Leaves</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="text-4xl">🔄</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.pendingTimeCorrections}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Pending Corrections</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-[#e29578]">
          <div className="flex items-center justify-between">
            <div className="text-4xl">📋</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#e29578] dark:text-[#e29578]">{stats.totalLeaveRequests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Leave Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md border-l-4 border-[#83c5be]">
          <div className="flex items-center justify-between">
            <div className="text-4xl">📊</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.totalAttendanceRecords}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Attendance Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left relative"
            onClick={() => onNavigate('leave-approval')}
          >
            <div className="text-4xl mb-3">📝</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">Review Leaves</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Approve or reject leave requests</div>
            {stats.pendingLeaves > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {stats.pendingLeaves}
              </div>
            )}
          </button>

          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left relative"
            onClick={() => onNavigate('time-correction-approval')}
          >
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">Time Corrections</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Review time correction requests</div>
            {stats.pendingTimeCorrections > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {stats.pendingTimeCorrections}
              </div>
            )}
          </button>

          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => onNavigate('employees')}
          >
            <div className="text-4xl mb-3">📁</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">Team Directory</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">View your team members</div>
          </button>

          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => onNavigate('reports')}
          >
            <div className="text-4xl mb-3">📈</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">Reports</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">View team analytics</div>
          </button>

          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => onNavigate('attendance')}
          >
            <div className="text-4xl mb-3">📅</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">My Attendance</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">View your attendance history</div>
          </button>

          <button
            className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            onClick={() => onNavigate('leave-requests')}
          >
            <div className="text-4xl mb-3">🏖️</div>
            <div className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be] mb-1">My Leaves</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Request and manage leaves</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Recent Team Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</div>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0f3460] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#006d77] dark:bg-[#83c5be] text-white dark:text-[#0a1929] flex items-center justify-center font-semibold text-lg">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#006d77] dark:text-[#83c5be] truncate">{activity.user}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{activity.action}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.time)}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-[#1e3a4f] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Top Performers by Hours</h2>
          <div className="space-y-3">
            {topEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No attendance data available</div>
            ) : (
              topEmployees.map((emp, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0f3460] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#e29578] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#006d77] dark:bg-[#83c5be] text-white dark:text-[#0a1929] flex items-center justify-center font-semibold text-lg">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#006d77] dark:text-[#83c5be] truncate">{emp.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{emp.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#006d77] dark:text-[#83c5be]">{emp.totalHours}h</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{emp.sessions} sessions</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
