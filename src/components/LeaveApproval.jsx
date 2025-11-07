import { useState, useEffect } from 'react'
import './LeaveApproval.css'

function LeaveApproval({ userRole }) {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')

  // Load leave requests based on user role
  useEffect(() => {
    loadRequests()
  }, [userRole])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')

    // Filter requests based on user role
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

  const handleApprove = (requestId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return
    }

    updateRequestStatus(requestId, 'approved')
  }

  const handleReject = (requestId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    updateRequestStatus(requestId, 'rejected', reason)
  }

  const updateRequestStatus = (requestId, status, rejectionReason = '') => {
    // Update global requests
    const allRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
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
    localStorage.setItem('allLeaveRequests', JSON.stringify(updatedRequests))

    // Update user's personal requests
    const request = allRequests.find(req => req.id === requestId)
    if (request) {
      const userRequests = JSON.parse(localStorage.getItem(`leaveRequests_${request.username}`) || '[]')
      const updatedUserRequests = userRequests.map(req => {
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
      localStorage.setItem(`leaveRequests_${request.username}`, JSON.stringify(updatedUserRequests))
    }

    // Reload requests
    loadRequests()
    alert(`Leave request ${status} successfully!`)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Filter requests by status
  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const pendingCount = requests.filter(req => req.status === 'pending').length
  const approvedCount = requests.filter(req => req.status === 'approved').length
  const rejectedCount = requests.filter(req => req.status === 'rejected').length

  return (
    <div className="leave-approval-container">
      <div className="leave-approval-header">
        <h1>Leave Approval</h1>
        <p>Review and approve leave requests from your team</p>
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
            <p>No {filter !== 'all' ? filter : ''} leave requests to display</p>
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
                  <div className="info-item">
                    <span className="info-label">Leave Type:</span>
                    <span className="info-value">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Days:</span>
                    <span className="info-value days-highlight">
                      {request.days} day{request.days > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Submitted:</span>
                    <span className="info-value">{formatDate(request.submittedDate)}</span>
                  </div>

                  <div className="info-item full-width">
                    <span className="info-label">Reason:</span>
                    <span className="info-value reason-text">{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div className="info-item full-width rejection-reason">
                      <span className="info-label">Rejection Reason:</span>
                      <span className="info-value">{request.rejectionReason}</span>
                    </div>
                  )}

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
                      onClick={() => handleApprove(request.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(request.id)}
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

export default LeaveApproval
