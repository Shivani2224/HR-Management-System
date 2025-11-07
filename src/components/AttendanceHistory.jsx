import { useState, useEffect } from 'react'
import './AttendanceHistory.css'

function AttendanceHistory({ username }) {
  const [attendanceData, setAttendanceData] = useState([])
  const [filterMonth, setFilterMonth] = useState('all')
  const [stats, setStats] = useState({
    totalDays: 0,
    totalHours: 0,
    totalBreaks: 0,
    avgHours: 0
  })

  useEffect(() => {
    loadAttendanceData()
  }, [username])

  useEffect(() => {
    calculateStats()
  }, [attendanceData, filterMonth])

  const loadAttendanceData = () => {
    const data = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    setAttendanceData(data)
  }

  const calculateStats = () => {
    const filtered = getFilteredData()
    const totalDays = filtered.length
    const totalHours = filtered.reduce((sum, session) => sum + (session.totalWorkedMs / (1000 * 60 * 60)), 0)
    const totalBreaks = filtered.reduce((sum, session) => sum + (session.totalBreakMs / (1000 * 60 * 60)), 0)
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0

    setStats({
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalBreaks: totalBreaks.toFixed(1),
      avgHours: avgHours.toFixed(1)
    })
  }

  const getFilteredData = () => {
    if (filterMonth === 'all') return attendanceData

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return attendanceData.filter(session => {
      const sessionDate = new Date(session.date)
      if (filterMonth === 'current') {
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
      } else if (filterMonth === 'last') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return sessionDate.getMonth() === lastMonth && sessionDate.getFullYear() === lastMonthYear
      }
      return true
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const downloadCSV = () => {
    const filtered = getFilteredData()
    if (filtered.length === 0) {
      alert('No data to download')
      return
    }

    // CSV Header
    const headers = ['Date', 'Login Time', 'Logout Time', 'Work Hours', 'Break Time']
    const csvRows = [headers.join(',')]

    // CSV Data
    filtered.forEach(session => {
      const row = [
        session.date,
        formatTime(session.loginTime),
        formatTime(session.logoutTime),
        session.totalWorked,
        session.totalBreak
      ]
      csvRows.push(row.join(','))
    })

    // Create CSV file
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${username}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredData = getFilteredData()

  return (
    <div className="attendance-history-container">
      <div className="attendance-header">
        <h1>Attendance History</h1>
        <p>View your work attendance records</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">Total Days</div>
            <div className="stat-value">{stats.totalDays}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-label">Total Hours</div>
            <div className="stat-value">{stats.totalHours}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">☕</div>
          <div className="stat-info">
            <div className="stat-label">Total Breaks</div>
            <div className="stat-value">{stats.totalBreaks}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">Avg Hours/Day</div>
            <div className="stat-value">{stats.avgHours}h</div>
          </div>
        </div>
      </div>

      {/* Filter and Download */}
      <div className="controls-bar">
        <div className="filter-group">
          <label>Filter by:</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="filter-select">
            <option value="all">All Time</option>
            <option value="current">This Month</option>
            <option value="last">Last Month</option>
          </select>
        </div>

        <button onClick={downloadCSV} className="download-btn">
          📥 Download CSV
        </button>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        {filteredData.length === 0 ? (
          <div className="no-data">
            <p>No attendance records found</p>
            <p className="hint">Start tracking your time to see records here</p>
          </div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Work Hours</th>
                <th>Break Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((session) => (
                <tr key={session.id}>
                  <td className="date-cell">{formatDate(session.date)}</td>
                  <td>{formatTime(session.loginTime)}</td>
                  <td>{formatTime(session.logoutTime)}</td>
                  <td className="work-cell">{session.totalWorked}</td>
                  <td className="break-cell">{session.totalBreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AttendanceHistory
