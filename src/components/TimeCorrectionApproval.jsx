import { useState, useEffect } from 'react'
import './TimeCorrectionApproval.css'

function TimeCorrectionApproval({ userRole }) {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    loadRequests()
  }, [userRole])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')

    // Filter based on role
    let filteredRequests = []
    if (userRole === 'manager') {
      // Managers see only employee requests
      filteredRequests = allRequests.filter(req => req.userRole === 'employee')
    } else if (userRole === 'admin') {
      // Admins see all requests (employees and managers)
      filteredRequests = allRequests.filter(req => req.userRole === 'employee' || req.userRole === 'manager')
    }

    setRequests(filteredRequests)
  }

  const handleApprove = (request) => {
    if (!window.confirm('Are you sure you want to approve this time correction?')) {
      return
    }

    // Update the original attendance record
    updateAttendanceRecord(request, 'approved')
    updateRequestStatus(request.id, 'approved')
  }

  const handleReject = (request) => {
    const reason = window.prompt('Please provide a reason for rejection:')
    if (reason === null) return // User cancelled

    if (!reason.trim()) {
      alert('Rejection reason is required')
      return
    }

    updateRequestStatus(request.id, 'rejected', reason)
  }

  const updateAttendanceRecord = (request, status) => {
    // Load employee's attendance records
    const attendanceHistory = JSON.parse(localStorage.getItem(`attendance_${request.username}`) || '[]')

    // Find and update the specific record
    const updatedHistory = attendanceHistory.map(record => {
      if (record.id === request.originalRecord.id) {
        // Calculate new work time and break time
        const newTotalTime = request.newLogoutTime - request.newLoginTime
        const breakMs = record.totalBreakMs
        const newWorkMs = newTotalTime - breakMs

        const workHours = Math.floor(newWorkMs / (1000 * 60 * 60))
        const workMinutes = Math.floor((newWorkMs % (1000 * 60 * 60)) / (1000 * 60))
        const workSeconds = Math.floor((newWorkMs % (1000 * 60)) / 1000)

        return {
          ...record,
          loginTime: request.newLoginTime,
          logoutTime: request.newLogoutTime,
          totalWorkedMs: newWorkMs,
          totalWorked: `${workHours}h ${workMinutes}m ${workSeconds}s`,
          corrected: true,
          correctionDate: new Date().toISOString()
        }
      }
      return record
    })

    localStorage.setItem(`attendance_${request.username}`, JSON.stringify(updatedHistory))
  }

  const updateRequestStatus = (requestId, status, rejectionReason = '') => {
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const updatedRequests = allRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status,
          rejectionReason,
          reviewedDate: new Date().toISOString(),
          reviewedBy: userRole
        }
      }
      return req
    })

    localStorage.setItem('timeCorrectionRequests', JSON.stringify(updatedRequests))
    loadRequests()
    alert(`Time correction ${status} successfully!`)
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
    })
  }

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge approved'
      case 'rejected':
        return 'status-badge rejected'
      default:
        return 'status-badge pending'
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const pendingCount = requests.filter(req => req.status === 'pending').length
  const approvedCount = requests.filter(req => req.status === 'approved').length
  const rejectedCount = requests.filter(req => req.status === 'rejected').length

  return (
    <div className="correction-approval-container">
      <div className="correction-approval-header">
        <h1>Time Correction Approval</h1>
        <p>Review and approve time correction requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === 'pending' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setFilter('pending')}
        >
          Pending <span className="count-badge">{pendingCount}</span>
        </button>
        <button
          className={filter === 'approved' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setFilter('approved')}
        >
          Approved <span className="count-badge">{approvedCount}</span>
        </button>
        <button
          className={filter === 'rejected' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setFilter('rejected')}
        >
          Rejected <span className="count-badge">{rejectedCount}</span>
        </button>
        <button
          className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setFilter('all')}
        >
          All <span className="count-badge">{requests.length}</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="approval-requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>No {filter !== 'all' ? filter : ''} time correction requests</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div key={request.id} className="approval-request-card">
                <div className="request-card-header">
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="employee-details">
                      <span className="employee-name">{request.username}</span>
                      <span className="employee-role">{request.userRole}</span>
                    </div>
                  </div>
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="request-info">
                  <div className="info-item full-width">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(request.originalRecord.date)}</span>
                  </div>

                  <div className="time-comparison">
                    <div className="comparison-section">
                      <h4>Original Times</h4>
                      <div className="time-details">
                        <div className="time-row">
                          <span>Login:</span>
                          <span>{formatDateTime(request.originalRecord.loginTime)}</span>
                        </div>
                        <div className="time-row">
                          <span>Logout:</span>
                          <span>{formatDateTime(request.originalRecord.logoutTime)}</span>
                        </div>
                        <div className="time-row work-time">
                          <span>Work Time:</span>
                          <span>{request.originalRecord.totalWorked}</span>
                        </div>
                      </div>
                    </div>

                    <div className="arrow-separator">→</div>

                    <div className="comparison-section requested">
                      <h4>Requested Times</h4>
                      <div className="time-details">
                        <div className="time-row">
                          <span>Login:</span>
                          <span>{formatDateTime(request.newLoginTime)}</span>
                        </div>
                        <div className="time-row">
                          <span>Logout:</span>
                          <span>{formatDateTime(request.newLogoutTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-item full-width reason-section">
                    <span className="info-label">Reason:</span>
                    <span className="info-value reason-text">{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div className="info-item full-width rejection-reason">
                      <span className="info-label">Rejection Reason:</span>
                      <span className="info-value">{request.rejectionReason}</span>
                    </div>
                  )}

                  <div className="info-item">
                    <span className="info-label">Submitted:</span>
                    <span className="info-value">{formatDate(request.submittedDate)}</span>
                  </div>

                  {request.reviewedDate && (
                    <div className="info-item">
                      <span className="info-label">Reviewed:</span>
                      <span className="info-value">{formatDate(request.reviewedDate)}</span>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(request)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(request)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeCorrectionApproval
