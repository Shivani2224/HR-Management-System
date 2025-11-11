import { useState, useEffect } from 'react'

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
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    }
  }

  return (
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-6">Time Correction</h1>
        <p className="text-gray-600 dark:text-gray-300">Request corrections to your attendance records</p>
      </div>

      {/* Edit Form */}
      {isEditing && selectedRecord && (
        <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] mb-8">
          <h2 className="text-xl font-semibold text-[#006d77] dark:text-[#83c5be] mb-4">Request Time Correction</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Original Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-sm text-gray-600 dark:text-gray-400">Date:</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatDate(selectedRecord.date)}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-600 dark:text-gray-400">Login:</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatTime(selectedRecord.loginTime)}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-600 dark:text-gray-400">Logout:</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatTime(selectedRecord.logoutTime)}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-600 dark:text-gray-400">Work Time:</span>
                <span className="text-gray-900 dark:text-white font-medium">{selectedRecord.totalWorked}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Login Time</label>
                <input
                  type="datetime-local"
                  value={newLoginTime}
                  onChange={(e) => setNewLoginTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Logout Time</label>
                <input
                  type="datetime-local"
                  value={newLogoutTime}
                  onChange={(e) => setNewLogoutTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Reason for Correction</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
                rows="4"
                placeholder="Please explain why you need this correction..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button className="px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={handleSubmitCorrection}>
                Submit Request
              </button>
              <button className="px-6 py-3 bg-[#f8f9fa] dark:bg-[#16213e] text-gray-700 dark:text-gray-200 rounded-lg font-semibold border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:border-[#006d77] transition-all" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance Records */}
      {!isEditing && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#006d77] dark:text-[#83c5be] mb-4">Recent Attendance (Last 7 Days)</h2>
          {attendanceRecords.length === 0 ? (
            <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] text-center">
              <p className="text-gray-600 dark:text-gray-300">No recent attendance records found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#16213e] rounded-lg overflow-hidden border border-[#e9ecef] dark:border-[#2a3f5f]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-[#16213e] border-b border-[#e9ecef] dark:border-[#2a3f5f]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Login Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Logout Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Work Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Break Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-[#e9ecef] dark:border-[#2a3f5f] hover:bg-[#f8f9fa] dark:hover:bg-[#16213e]/50">
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatTime(record.loginTime)}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatTime(record.logoutTime)}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.totalWorked}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.totalBreak}</td>
                      <td className="px-6 py-4">
                        <button
                          className="px-4 py-2 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
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
        <div>
          <h2 className="text-xl font-semibold text-[#006d77] dark:text-[#83c5be] mb-4">My Correction Requests</h2>
          {correctionRequests.length === 0 ? (
            <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] text-center">
              <p className="text-gray-600 dark:text-gray-300">No correction requests submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {correctionRequests.map((request) => (
                <div key={request.id} className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(request.originalRecord.date)}
                    </span>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Original</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Login: {formatTime(request.originalRecord.loginTime)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Logout: {formatTime(request.originalRecord.logoutTime)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Requested</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Login: {formatTime(request.newLoginTime)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Logout: {formatTime(request.newLogoutTime)}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f3460] p-4 rounded-lg mb-2">
                    <strong className="text-gray-900 dark:text-white">Reason:</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-2">
                      <strong className="text-gray-900 dark:text-white">Rejection Reason:</strong>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{request.rejectionReason}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-[#e9ecef] dark:border-[#2a3f5f]">
                    <span>Submitted: {formatDate(request.submittedDate)}</span>
                    {request.reviewedDate && (
                      <span>Reviewed: {formatDate(request.reviewedDate)}</span>
                    )}
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
