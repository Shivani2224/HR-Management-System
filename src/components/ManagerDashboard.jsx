import { useState, useEffect } from 'react'
import './ManagerDashboard.css'

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
      case 'pending': return 'status-pending'
      case 'approved': return 'status-approved'
      case 'rejected': return 'status-rejected'
      default: return ''
    }
  }

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Welcome back, {user.username}! Here's your team overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <div className="stat-value">{stats.activeToday}</div>
            <div className="stat-label">Active Today</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-details">
            <div className="stat-value">{stats.pendingLeaves}</div>
            <div className="stat-label">Pending Leaves</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🔄</div>
          <div className="stat-details">
            <div className="stat-value">{stats.pendingTimeCorrections}</div>
            <div className="stat-label">Pending Corrections</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📋</div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalLeaveRequests}</div>
            <div className="stat-label">Total Leave Requests</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalAttendanceRecords}</div>
            <div className="stat-label">Attendance Records</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-card" onClick={() => onNavigate('leave-approval')}>
            <div className="action-icon">📝</div>
            <div className="action-title">Review Leaves</div>
            <div className="action-description">Approve or reject leave requests</div>
            {stats.pendingLeaves > 0 && (
              <div className="action-badge">{stats.pendingLeaves}</div>
            )}
          </button>

          <button className="action-card" onClick={() => onNavigate('time-correction-approval')}>
            <div className="action-icon">⏱️</div>
            <div className="action-title">Time Corrections</div>
            <div className="action-description">Review time correction requests</div>
            {stats.pendingTimeCorrections > 0 && (
              <div className="action-badge">{stats.pendingTimeCorrections}</div>
            )}
          </button>

          <button className="action-card" onClick={() => onNavigate('employees')}>
            <div className="action-icon">📁</div>
            <div className="action-title">Team Directory</div>
            <div className="action-description">View your team members</div>
          </button>

          <button className="action-card" onClick={() => onNavigate('reports')}>
            <div className="action-icon">📈</div>
            <div className="action-title">Reports</div>
            <div className="action-description">View team analytics</div>
          </button>

          <button className="action-card" onClick={() => onNavigate('attendance')}>
            <div className="action-icon">📅</div>
            <div className="action-title">My Attendance</div>
            <div className="action-description">View your attendance history</div>
          </button>

          <button className="action-card" onClick={() => onNavigate('leave-requests')}>
            <div className="action-icon">🏖️</div>
            <div className="action-title">My Leaves</div>
            <div className="action-description">Request and manage leaves</div>
          </button>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Team Activity</h2>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="no-activity">No recent activity</div>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-avatar">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-details">
                    <div className="activity-user">{activity.user}</div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-time">{formatDate(activity.time)}</div>
                  </div>
                  <div className={`activity-status ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="top-employees-section">
          <h2>Top Performers by Hours</h2>
          <div className="employees-list">
            {topEmployees.length === 0 ? (
              <div className="no-employees">No attendance data available</div>
            ) : (
              topEmployees.map((emp, index) => (
                <div key={index} className="employee-item">
                  <div className="employee-rank">{index + 1}</div>
                  <div className="employee-avatar">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <div className="employee-name">{emp.name}</div>
                    <div className="employee-role">{emp.role}</div>
                  </div>
                  <div className="employee-stats">
                    <div className="employee-hours">{emp.totalHours}h</div>
                    <div className="employee-sessions">{emp.sessions} sessions</div>
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
