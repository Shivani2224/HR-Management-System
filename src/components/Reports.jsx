import { useState, useEffect } from 'react'

function Reports() {
  const [reportType, setReportType] = useState('attendance')
  const [dateRange, setDateRange] = useState('month')
  const [attendanceData, setAttendanceData] = useState({})
  const [leaveData, setLeaveData] = useState({})
  const [summaryStats, setSummaryStats] = useState({})

  useEffect(() => {
    loadReportData()
  }, [reportType, dateRange])

  const loadReportData = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employees = users.filter(u => u.role === 'employee' || u.role === 'manager')

    // Calculate summary statistics
    calculateSummaryStats(employees)

    // Load attendance report
    if (reportType === 'attendance') {
      loadAttendanceReport(employees)
    }

    // Load leave report
    if (reportType === 'leave') {
      loadLeaveReport(employees)
    }
  }

  const calculateSummaryStats = (employees) => {
    let totalHours = 0
    let totalBreak = 0
    let totalSessions = 0
    let totalLeaves = 0
    let approvedLeaves = 0
    let pendingLeaves = 0

    employees.forEach(emp => {
      // Attendance data
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')
      totalSessions += attendance.length

      attendance.forEach(record => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60)
        totalBreak += record.totalBreakMs / (1000 * 60 * 60)
      })

      // Leave data
      const leaves = JSON.parse(localStorage.getItem(`leaveRequests_${emp.name}`) || '[]')
      totalLeaves += leaves.length
      approvedLeaves += leaves.filter(l => l.status === 'approved').length
      pendingLeaves += leaves.filter(l => l.status === 'pending').length
    })

    setSummaryStats({
      totalEmployees: employees.length,
      totalHours: totalHours.toFixed(1),
      avgHoursPerEmployee: employees.length > 0 ? (totalHours / employees.length).toFixed(1) : '0',
      totalBreak: totalBreak.toFixed(1),
      totalSessions,
      avgSessionsPerEmployee: employees.length > 0 ? (totalSessions / employees.length).toFixed(1) : '0',
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      leaveApprovalRate: totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(1) : '0'
    })
  }

  const loadAttendanceReport = (employees) => {
    const data = []

    employees.forEach(emp => {
      const attendance = JSON.parse(localStorage.getItem(`attendance_${emp.name}`) || '[]')

      let totalHours = 0
      let totalBreak = 0

      attendance.forEach(record => {
        totalHours += record.totalWorkedMs / (1000 * 60 * 60)
        totalBreak += record.totalBreakMs / (1000 * 60 * 60)
      })

      if (attendance.length > 0) {
        data.push({
          name: emp.name,
          role: emp.role,
          sessions: attendance.length,
          totalHours: totalHours.toFixed(1),
          avgHours: (totalHours / attendance.length).toFixed(1),
          totalBreak: totalBreak.toFixed(1),
          lastActivity: attendance[0].date
        })
      }
    })

    // Sort by total hours descending
    data.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours))

    setAttendanceData({ employees: data })
  }

  const loadLeaveReport = (employees) => {
    const data = []

    employees.forEach(emp => {
      const leaves = JSON.parse(localStorage.getItem(`leaveRequests_${emp.name}`) || '[]')

      const approved = leaves.filter(l => l.status === 'approved')
      const pending = leaves.filter(l => l.status === 'pending')
      const rejected = leaves.filter(l => l.status === 'rejected')

      let totalDays = 0
      approved.forEach(leave => {
        totalDays += leave.days
      })

      data.push({
        name: emp.name,
        role: emp.role,
        totalRequests: leaves.length,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        totalDays
      })
    })

    // Sort by total requests descending
    data.sort((a, b) => b.totalRequests - a.totalRequests)

    setLeaveData({ employees: data })
  }

  const handleExportCSV = () => {
    let csvContent = ''
    let filename = ''

    if (reportType === 'attendance') {
      csvContent = 'Name,Role,Sessions,Total Hours,Avg Hours,Total Break,Last Activity\n'
      attendanceData.employees?.forEach(emp => {
        csvContent += `${emp.name},${emp.role},${emp.sessions},${emp.totalHours},${emp.avgHours},${emp.totalBreak},${emp.lastActivity}\n`
      })
      filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
    } else if (reportType === 'leave') {
      csvContent = 'Name,Role,Total Requests,Approved,Pending,Rejected,Total Days\n'
      leaveData.employees?.forEach(emp => {
        csvContent += `${emp.name},${emp.role},${emp.totalRequests},${emp.approved},${emp.pending},${emp.rejected},${emp.totalDays}\n`
      })
      filename = `leave_report_${new Date().toISOString().split('T')[0]}.csv`
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>View comprehensive reports and statistics</p>
        </div>
        <button className="btn-export" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <div className="stat-value">{summaryStats.totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">⏰</div>
          <div className="stat-details">
            <div className="stat-value">{summaryStats.totalHours}h</div>
            <div className="stat-label">Total Hours Worked</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <div className="stat-value">{summaryStats.avgHoursPerEmployee}h</div>
            <div className="stat-label">Avg Hours/Employee</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📝</div>
          <div className="stat-details">
            <div className="stat-value">{summaryStats.totalLeaves}</div>
            <div className="stat-label">Total Leave Requests</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <div className="stat-value">{summaryStats.leaveApprovalRate}%</div>
            <div className="stat-label">Approval Rate</div>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="report-controls">
        <div className="report-type-selector">
          <button
            className={reportType === 'attendance' ? 'type-btn active' : 'type-btn'}
            onClick={() => setReportType('attendance')}
          >
            Attendance Report
          </button>
          <button
            className={reportType === 'leave' ? 'type-btn active' : 'type-btn'}
            onClick={() => setReportType('leave')}
          >
            Leave Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {reportType === 'attendance' && (
          <div className="report-table-container">
            <h2>Attendance Report</h2>
            <div className="report-table">
              <div className="table-header">
                <div className="col">Employee</div>
                <div className="col">Role</div>
                <div className="col">Sessions</div>
                <div className="col">Total Hours</div>
                <div className="col">Avg Hours</div>
                <div className="col">Total Break</div>
                <div className="col">Last Activity</div>
              </div>

              {attendanceData.employees?.length === 0 ? (
                <div className="no-data">No attendance data available</div>
              ) : (
                attendanceData.employees?.map((emp, index) => (
                  <div key={index} className="table-row">
                    <div className="col employee-name">
                      <div className="employee-avatar">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      {emp.name}
                    </div>
                    <div className="col">
                      <span className={`role-badge ${emp.role}`}>{emp.role}</span>
                    </div>
                    <div className="col">{emp.sessions}</div>
                    <div className="col highlight-success">{emp.totalHours}h</div>
                    <div className="col">{emp.avgHours}h</div>
                    <div className="col highlight-warning">{emp.totalBreak}h</div>
                    <div className="col">{emp.lastActivity}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {reportType === 'leave' && (
          <div className="report-table-container">
            <h2>Leave Report</h2>
            <div className="report-table">
              <div className="table-header">
                <div className="col">Employee</div>
                <div className="col">Role</div>
                <div className="col">Total Requests</div>
                <div className="col">Approved</div>
                <div className="col">Pending</div>
                <div className="col">Rejected</div>
                <div className="col">Total Days</div>
              </div>

              {leaveData.employees?.length === 0 ? (
                <div className="no-data">No leave data available</div>
              ) : (
                leaveData.employees?.map((emp, index) => (
                  <div key={index} className="table-row">
                    <div className="col employee-name">
                      <div className="employee-avatar">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      {emp.name}
                    </div>
                    <div className="col">
                      <span className={`role-badge ${emp.role}`}>{emp.role}</span>
                    </div>
                    <div className="col">{emp.totalRequests}</div>
                    <div className="col highlight-success">{emp.approved}</div>
                    <div className="col highlight-warning">{emp.pending}</div>
                    <div className="col highlight-danger">{emp.rejected}</div>
                    <div className="col highlight-info">{emp.totalDays}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
