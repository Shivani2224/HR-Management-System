import { useState, useEffect } from 'react'

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
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
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
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-6">Time Correction Approval</h1>
        <p className="text-gray-600 dark:text-gray-300">Review and approve time correction requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={filter === 'pending' ? 'px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all' : 'px-6 py-3 bg-[#f8f9fa] dark:bg-[#16213e] text-gray-700 dark:text-gray-200 rounded-lg font-semibold border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:border-[#006d77] transition-all'}
          onClick={() => setFilter('pending')}
        >
          Pending <span className="ml-2 px-2 py-1 bg-white dark:bg-[#0f3460] rounded-full text-xs">{pendingCount}</span>
        </button>
        <button
          className={filter === 'approved' ? 'px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all' : 'px-6 py-3 bg-[#f8f9fa] dark:bg-[#16213e] text-gray-700 dark:text-gray-200 rounded-lg font-semibold border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:border-[#006d77] transition-all'}
          onClick={() => setFilter('approved')}
        >
          Approved <span className="ml-2 px-2 py-1 bg-white dark:bg-[#0f3460] rounded-full text-xs">{approvedCount}</span>
        </button>
        <button
          className={filter === 'rejected' ? 'px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all' : 'px-6 py-3 bg-[#f8f9fa] dark:bg-[#16213e] text-gray-700 dark:text-gray-200 rounded-lg font-semibold border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:border-[#006d77] transition-all'}
          onClick={() => setFilter('rejected')}
        >
          Rejected <span className="ml-2 px-2 py-1 bg-white dark:bg-[#0f3460] rounded-full text-xs">{rejectedCount}</span>
        </button>
        <button
          className={filter === 'all' ? 'px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all' : 'px-6 py-3 bg-[#f8f9fa] dark:bg-[#16213e] text-gray-700 dark:text-gray-200 rounded-lg font-semibold border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:border-[#006d77] transition-all'}
          onClick={() => setFilter('all')}
        >
          All <span className="ml-2 px-2 py-1 bg-white dark:bg-[#0f3460] rounded-full text-xs">{requests.length}</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] text-center">
            <p className="text-gray-600 dark:text-gray-300">No {filter !== 'all' ? filter : ''} time correction requests</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006d77] to-[#83c5be] flex items-center justify-center text-white font-bold text-xl">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-900 dark:text-white">{request.username}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{request.userRole}</span>
                    </div>
                  </div>
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{formatDate(request.originalRecord.date)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white dark:bg-[#0f3460] rounded-lg">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Original Times</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Login:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(request.originalRecord.loginTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Logout:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(request.originalRecord.logoutTime)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#e9ecef] dark:border-[#2a3f5f]">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Work Time:</span>
                          <span className="text-sm text-[#006d77] dark:text-[#83c5be] font-semibold">{request.originalRecord.totalWorked}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-2 border-[#83c5be] pl-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Requested Times</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Login:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(request.newLoginTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Logout:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(request.newLogoutTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-white">Reason:</span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <span className="font-semibold text-gray-900 dark:text-white">Rejection Reason:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{request.rejectionReason}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm pt-3 border-t border-[#e9ecef] dark:border-[#2a3f5f]">
                    <span className="text-gray-600 dark:text-gray-400">Submitted: {formatDate(request.submittedDate)}</span>
                    {request.reviewedDate && (
                      <span className="text-gray-600 dark:text-gray-400">Reviewed: {formatDate(request.reviewedDate)}</span>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 mt-4 border-t-2 border-[#e9ecef] dark:border-[#2a3f5f]">
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      onClick={() => handleApprove(request)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
