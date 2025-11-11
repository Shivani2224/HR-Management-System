import { useState, useEffect } from 'react'

function AttendanceHistory({ username }) {
  const [attendanceData, setAttendanceData] = useState([])
  const [filterMonth, setFilterMonth] = useState('all')
  const [stats, setStats] = useState({
    totalDays: 0,
    totalHours: 0,
    totalBreaks: 0,
    avgHours: 0
  })

  useEffect(() => {
    loadAttendanceData()
  }, [username])

  useEffect(() => {
    calculateStats()
  }, [attendanceData, filterMonth])

  const loadAttendanceData = () => {
    const data = JSON.parse(localStorage.getItem(`attendance_${username}`) || '[]')
    setAttendanceData(data)
  }

  const calculateStats = () => {
    const filtered = getFilteredData()
    const totalDays = filtered.length
    const totalHours = filtered.reduce((sum, session) => sum + (session.totalWorkedMs / (1000 * 60 * 60)), 0)
    const totalBreaks = filtered.reduce((sum, session) => sum + (session.totalBreakMs / (1000 * 60 * 60)), 0)
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0

    setStats({
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalBreaks: totalBreaks.toFixed(1),
      avgHours: avgHours.toFixed(1)
    })
  }

  const getFilteredData = () => {
    if (filterMonth === 'all') return attendanceData

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return attendanceData.filter(session => {
      const sessionDate = new Date(session.date)
      if (filterMonth === 'current') {
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
      } else if (filterMonth === 'last') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return sessionDate.getMonth() === lastMonth && sessionDate.getFullYear() === lastMonthYear
      }
      return true
    })
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
      second: '2-digit'
    })
  }

  const downloadCSV = () => {
    const filtered = getFilteredData()
    if (filtered.length === 0) {
      alert('No data to download')
      return
    }

    // CSV Header
    const headers = ['Date', 'Login Time', 'Logout Time', 'Work Hours', 'Break Time']
    const csvRows = [headers.join(',')]

    // CSV Data
    filtered.forEach(session => {
      const row = [
        session.date,
        formatTime(session.loginTime),
        formatTime(session.logoutTime),
        session.totalWorked,
        session.totalBreak
      ]
      csvRows.push(row.join(','))
    })

    // Create CSV file
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${username}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredData = getFilteredData()

  return (
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-6">Attendance History</h1>
        <p className="text-gray-600 dark:text-gray-300">View your work attendance records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📅</div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Days</div>
              <div className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.totalDays}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⏰</div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
              <div className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.totalHours}h</div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">☕</div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Breaks</div>
              <div className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.totalBreaks}h</div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-6 rounded-lg border-2 border-[#e9ecef] dark:border-[#2a3f5f]">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📊</div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Hours/Day</div>
              <div className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be]">{stats.avgHours}h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Download */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <label className="text-gray-700 dark:text-gray-200 font-medium">Filter by:</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-4 py-3 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77]">
            <option value="all">All Time</option>
            <option value="current">This Month</option>
            <option value="last">Last Month</option>
          </select>
        </div>

        <button onClick={downloadCSV} className="px-6 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
          📥 Download CSV
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-[#16213e] rounded-lg overflow-hidden border border-[#e9ecef] dark:border-[#2a3f5f]">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">No attendance records found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start tracking your time to see records here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fa] dark:bg-[#16213e] border-b border-[#e9ecef] dark:border-[#2a3f5f]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Login Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Logout Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Work Hours</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#006d77] dark:text-[#83c5be]">Break Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((session) => (
                <tr key={session.id} className="border-b border-[#e9ecef] dark:border-[#2a3f5f] hover:bg-[#f8f9fa] dark:hover:bg-[#16213e]/50">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{formatDate(session.date)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatTime(session.loginTime)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatTime(session.logoutTime)}</td>
                  <td className="px-6 py-4 text-[#006d77] dark:text-[#83c5be] font-semibold">{session.totalWorked}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{session.totalBreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AttendanceHistory
