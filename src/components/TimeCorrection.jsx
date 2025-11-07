import { useState, useEffect } from 'react'
import './TimeCorrection.css'

function TimeCorrection({ username, userRole }) {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [correctionRequests, setCorrectionRequests] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Form fields for correction
  const [newLoginTime, setNewLoginTime] = useState('')
  const [newLogoutTime, setNewLogoutTime] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')

  useEffect(() => {
    loadAttendanceRecords()
    loadCorrectionRequests()
  }, [username])

  const loadAttendanceRecords = () => {
    // Load recent attendance (last 7 days)
    const allRecords = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRecords = allRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= sevenDaysAgo
    })

    setAttendanceRecords(recentRecords)
  }

  const loadCorrectionRequests = () => {
    const requests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    const myRequests = requests.filter(req => req.username === username)
    setCorrectionRequests(myRequests)
  }

  const handleSelectRecord = (record) => {
    setSelectedRecord(record)
    setIsEditing(true)

    // Set initial values
    const loginDate = new Date(record.loginTime)
    const logoutDate = new Date(record.logoutTime)

    setNewLoginTime(formatDateTimeForInput(loginDate))
    setNewLogoutTime(formatDateTimeForInput(logoutDate))
    setCorrectionReason('')
  }

  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmitCorrection = () => {
    if (!correctionReason.trim()) {
      alert('Please provide a reason for the time correction')
      return
    }

    const newLoginDate = new Date(newLoginTime)
    const newLogoutDate = new Date(newLogoutTime)

    if (newLogoutDate <= newLoginDate) {
      alert('Logout time must be after login time')
      return
    }

    // Create correction request
    const correctionRequest = {
      id: Date.now(),
      username,
      userRole,
      originalRecord: selectedRecord,
      newLoginTime: newLoginDate.getTime(),
      newLogoutTime: newLogoutDate.getTime(),
      reason: correctionReason,
      status: 'pending',
      submittedDate: new Date().toISOString(),
    }

    // Save to global correction requests
    const allRequests = JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]')
    allRequests.unshift(correctionRequest)
    localStorage.setItem('timeCorrectionRequests', JSON.stringify(allRequests))

    alert('Time correction request submitted successfully! Waiting for manager approval.')

    // Reset form
    setIsEditing(false)
    setSelectedRecord(null)
    setNewLoginTime('')
    setNewLogoutTime('')
    setCorrectionReason('')

    loadCorrectionRequests()
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedRecord(null)
    setNewLoginTime('')
    setNewLogoutTime('')
    setCorrectionReason('')
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

  return (
    <div className="time-correction-container">
      <div className="time-correction-header">
        <h1>Time Correction</h1>
        <p>Request corrections to your attendance records</p>
      </div>

      {/* Edit Form */}
      {isEditing && selectedRecord && (
        <div className="correction-form-card">
          <h2>Request Time Correction</h2>
          <div className="original-record-info">
            <h3>Original Record</h3>
            <div className="info-grid">
              <div className="info-item">
                <span>Date:</span>
                <span>{formatDate(selectedRecord.date)}</span>
              </div>
              <div className="info-item">
                <span>Login:</span>
                <span>{formatTime(selectedRecord.loginTime)}</span>
              </div>
              <div className="info-item">
                <span>Logout:</span>
                <span>{formatTime(selectedRecord.logoutTime)}</span>
              </div>
              <div className="info-item">
                <span>Work Time:</span>
                <span>{selectedRecord.totalWorked}</span>
              </div>
            </div>
          </div>

          <div className="correction-form">
            <h3>New Times</h3>
            <div className="form-row">
              <div className="form-group">
                <label>New Login Time</label>
                <input
                  type="datetime-local"
                  value={newLoginTime}
                  onChange={(e) => setNewLoginTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>New Logout Time</label>
                <input
                  type="datetime-local"
                  value={newLogoutTime}
                  onChange={(e) => setNewLogoutTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Correction</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="form-input"
                rows="4"
                placeholder="Please explain why you need this correction..."
              />
            </div>

            <div className="form-actions">
              <button className="submit-btn" onClick={handleSubmitCorrection}>
                Submit Request
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance Records */}
      {!isEditing && (
        <div className="records-section">
          <h2>Recent Attendance (Last 7 Days)</h2>
          {attendanceRecords.length === 0 ? (
            <div className="no-data">
              <p>No recent attendance records found</p>
            </div>
          ) : (
            <div className="records-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Work Time</th>
                    <th>Break Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{formatTime(record.loginTime)}</td>
                      <td>{formatTime(record.logoutTime)}</td>
                      <td>{record.totalWorked}</td>
                      <td>{record.totalBreak}</td>
                      <td>
                        <button
                          className="correct-btn"
                          onClick={() => handleSelectRecord(record)}
                        >
                          Request Correction
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Correction Requests History */}
      {!isEditing && (
        <div className="requests-section">
          <h2>My Correction Requests</h2>
          {correctionRequests.length === 0 ? (
            <div className="no-data">
              <p>No correction requests submitted</p>
            </div>
          ) : (
            <div className="requests-list">
              {correctionRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <span className="request-date">
                      {formatDate(request.originalRecord.date)}
                    </span>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="request-details">
                    <div className="detail-comparison">
                      <div className="detail-column">
                        <h4>Original</h4>
                        <p>Login: {formatTime(request.originalRecord.loginTime)}</p>
                        <p>Logout: {formatTime(request.originalRecord.logoutTime)}</p>
                      </div>
                      <div className="arrow">→</div>
                      <div className="detail-column">
                        <h4>Requested</h4>
                        <p>Login: {formatTime(request.newLoginTime)}</p>
                        <p>Logout: {formatTime(request.newLogoutTime)}</p>
                      </div>
                    </div>

                    <div className="reason-box">
                      <strong>Reason:</strong> {request.reason}
                    </div>

                    {request.rejectionReason && (
                      <div className="rejection-box">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                      </div>
                    )}

                    <div className="request-footer">
                      <span>Submitted: {formatDate(request.submittedDate)}</span>
                      {request.reviewedDate && (
                        <span>Reviewed: {formatDate(request.reviewedDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeCorrection
