import { useState, useEffect } from 'react'

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
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
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
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-6">Leave Approval</h1>
        <p className="text-gray-600 dark:text-gray-300">Review and approve leave requests from your team</p>
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
            <p className="text-gray-600 dark:text-gray-300">No {filter !== 'all' ? filter : ''} leave requests to display</p>
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

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Leave Type:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Days:</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-[#006d77] dark:text-[#83c5be]">
                      {request.days} day{request.days > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(request.submittedDate)}</span>
                  </div>

                  <div className="flex flex-col gap-1 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                    <span className="text-gray-900 dark:text-white">{request.reason}</span>
                  </div>

                  {request.rejectionReason && (
                    <div className="flex flex-col gap-1 pt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Rejection Reason:</span>
                      <span className="text-gray-900 dark:text-white">{request.rejectionReason}</span>
                    </div>
                  )}

                  {request.reviewedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reviewed:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(request.reviewedDate)}</span>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t-2 border-[#e9ecef] dark:border-[#2a3f5f]">
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      onClick={() => handleApprove(request.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
