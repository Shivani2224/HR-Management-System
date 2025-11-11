import { useState, useEffect } from 'react'

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

  return (
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-6">Leave Requests</h1>
        <p className="text-gray-600 dark:text-gray-300">Submit and manage your leave requests</p>
      </div>

      {/* Submit New Request Form */}
      <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] mb-8">
        <h2 className="text-xl font-semibold text-[#006d77] dark:text-[#83c5be] mb-4">Submit New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Leave Type</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]"
              rows="4"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <button type="submit" className="px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Submit Request
          </button>
        </form>
      </div>

      {/* Request History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#006d77] dark:text-[#83c5be]">My Leave Requests</h2>
        {requests.length === 0 ? (
          <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f] text-center">
            <p className="text-gray-600 dark:text-gray-300">No leave requests submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span className="text-lg font-semibold text-[#006d77] dark:text-[#83c5be]">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                    </span>
                  </div>
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({request.days} day{request.days > 1 ? 's' : ''})</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(request.submittedDate)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                    <span className="text-gray-900 dark:text-white">{request.reason}</span>
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
