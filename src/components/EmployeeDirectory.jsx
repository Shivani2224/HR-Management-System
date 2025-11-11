import { useState, useEffect } from 'react'

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [employeeStats, setEmployeeStats] = useState({})

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, roleFilter])

  const loadEmployees = () => {
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    const employeeList = users.filter(u => u.role === 'employee' || u.role === 'manager')
    setEmployees(employeeList)
  }

  const filterEmployees = () => {
    let filtered = [...employees]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter)
    }

    setFilteredEmployees(filtered)
  }

  const loadEmployeeStats = (employee) => {
    // Load attendance data
    const attendance = JSON.parse(localStorage.getItem(`attendance_${employee.name}`) || '[]')

    let totalHours = 0
    let totalBreak = 0

    attendance.forEach(record => {
      totalHours += record.totalWorkedMs / (1000 * 60 * 60)
      totalBreak += record.totalBreakMs / (1000 * 60 * 60)
    })

    // Load leave requests
    const leaveRequests = JSON.parse(localStorage.getItem(`leaveRequests_${employee.name}`) || '[]')
    const approvedLeaves = leaveRequests.filter(req => req.status === 'approved')
    const pendingLeaves = leaveRequests.filter(req => req.status === 'pending')

    // Load time corrections
    const timeCorrections = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const employeeCorrections = timeCorrections.filter(req => req.username === employee.name)

    // Load profile
    const profile = JSON.parse(localStorage.getItem(`profile_${employee.name}`) || '{}')

    // Check active session
    const activeSession = JSON.parse(localStorage.getItem(`activeSession_${employee.name}`) || '{}')

    return {
      totalSessions: attendance.length,
      totalHours: totalHours.toFixed(1),
      totalBreak: totalBreak.toFixed(1),
      avgHours: attendance.length > 0 ? (totalHours / attendance.length).toFixed(1) : '0',
      totalLeaves: leaveRequests.length,
      approvedLeaves: approvedLeaves.length,
      pendingLeaves: pendingLeaves.length,
      totalCorrections: employeeCorrections.length,
      profile,
      isActive: activeSession.isLoggedIn || false,
      lastLogin: attendance.length > 0 ? attendance[0].loginTime : null
    }
  }

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    const stats = loadEmployeeStats(employee)
    setEmployeeStats(stats)
    setShowDetailsModal(true)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'manager': return 'role-badge manager'
      case 'employee': return 'role-badge employee'
      default: return 'role-badge'
    }
  }

  return (
    <div className="employee-directory-container">
      <div className="directory-header">
        <div>
          <h1>Employee Directory</h1>
          <p>View all employees and their information</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <label>Filter by Role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Employees</option>
            <option value="manager">Managers</option>
            <option value="employee">Employees</option>
          </select>
        </div>

        <div className="employee-count">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="employees-grid">
        {filteredEmployees.length === 0 ? (
          <div className="no-employees">No employees found</div>
        ) : (
          filteredEmployees.map((employee, index) => {
            const stats = loadEmployeeStats(employee)
            return (
              <div key={index} className="employee-card">
                <div className="card-header">
                  <div className="employee-avatar-large">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  {stats.isActive && <div className="active-indicator">Active</div>}
                </div>

                <div className="card-body">
                  <h3>{employee.name}</h3>
                  <span className={getRoleBadgeClass(employee.role)}>
                    {employee.role}
                  </span>
                  <p className="employee-email">{employee.email}</p>

                  <div className="quick-stats">
                    <div className="stat-item">
                      <div className="stat-value">{stats.totalHours}h</div>
                      <div className="stat-label">Total Hours</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.totalSessions}</div>
                      <div className="stat-label">Sessions</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{stats.approvedLeaves}</div>
                      <div className="stat-label">Leaves</div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="btn-view-details" onClick={() => handleViewDetails(employee)}>
                    View Details
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content employee-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="employee-profile-section">
                <div className="profile-avatar-large">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{selectedEmployee.name}</h3>
                  <span className={getRoleBadgeClass(selectedEmployee.role)}>
                    {selectedEmployee.role}
                  </span>
                  <p>{selectedEmployee.email}</p>
                  {employeeStats.isActive && (
                    <div className="active-status">Currently Active</div>
                  )}
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{employeeStats.profile.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{employeeStats.profile.department || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Join Date:</span>
                    <span className="detail-value">
                      {employeeStats.profile.joinDate ? new Date(employeeStats.profile.joinDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">{formatDate(employeeStats.lastLogin)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Attendance Statistics</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Sessions:</span>
                    <span className="detail-value">{employeeStats.totalSessions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Hours Worked:</span>
                    <span className="detail-value highlight-success">{employeeStats.totalHours}h</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Average Hours/Day:</span>
                    <span className="detail-value">{employeeStats.avgHours}h</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Break Time:</span>
                    <span className="detail-value">{employeeStats.totalBreak}h</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Leave Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Total Requests:</span>
                    <span className="detail-value">{employeeStats.totalLeaves}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Approved Leaves:</span>
                    <span className="detail-value highlight-success">{employeeStats.approvedLeaves}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pending Requests:</span>
                    <span className="detail-value highlight-warning">{employeeStats.pendingLeaves}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Other Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Time Corrections:</span>
                    <span className="detail-value">{employeeStats.totalCorrections}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact:</span>
                    <span className="detail-value">{employeeStats.profile.emergencyContact || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Phone:</span>
                    <span className="detail-value">{employeeStats.profile.emergencyPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory
