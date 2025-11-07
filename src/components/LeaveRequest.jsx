import { useState, useEffect } from 'react'
import './LeaveRequest.css'

function LeaveRequest({ username, userRole }) {
  const [leaveType, setLeaveType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [requests, setRequests] = useState([])

  // Load existing requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem(`leaveRequests_${username}`)
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests))
    }
  }, [username])

  // Save requests to localStorage whenever they change
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem(`leaveRequests_${username}`, JSON.stringify(requests))
    }
  }, [requests, username])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date')
      return
    }

    if (!reason.trim()) {
      alert('Please provide a reason for your leave request')
      return
    }

    // Calculate number of days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    // Create new request
    const newRequest = {
      id: Date.now(),
      username,
      userRole,
      type: leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
      submittedDate: new Date().toISOString(),
    }

    // Save to user's personal list
    setRequests([newRequest, ...requests])

    // Save to global list for manager/admin approval
    const globalRequests = JSON.parse(localStorage.getItem('allLeaveRequests') || '[]')
    globalRequests.unshift(newRequest)
    localStorage.setItem('allLeaveRequests', JSON.stringify(globalRequests))

    // Reset form
    setLeaveType('vacation')
    setStartDate('')
    setEndDate('')
    setReason('')

    alert('Leave request submitted successfully!')
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

  return (
    <div className="leave-request-container">
      <div className="leave-request-header">
        <h1>Leave Requests</h1>
        <p>Submit and manage your leave requests</p>
      </div>

      {/* Submit New Request Form */}
      <div className="request-form-card">
        <h2>Submit New Request</h2>
        <form onSubmit={handleSubmit} className="leave-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leaveType">Leave Type</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="form-input"
              >
                <option value="vacation">Vacation Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input form-textarea"
              rows="4"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Request
          </button>
        </form>
      </div>

      {/* Request History */}
      <div className="request-history">
        <h2>My Leave Requests</h2>
        {requests.length === 0 ? (
          <div className="no-requests">
            <p>No leave requests submitted yet</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-type">
                    <span className="type-icon">📅</span>
                    <span className="type-text">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                    </span>
                  </div>
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      <span className="days-count"> ({request.days} day{request.days > 1 ? 's' : ''})</span>
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">
                      {formatDate(request.submittedDate)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value reason-text">{request.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveRequest
