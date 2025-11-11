import { useState, useEffect } from 'react'

function Settings({ userRole }) {
  const [settings, setSettings] = useState({
    companyName: 'HR System',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    leavePolicies: {
      vacation: 15,
      sick: 10,
      personal: 5
    },
    holidays: [],
    autoLogoutEnabled: true,
    breakRemindersEnabled: true,
    breakReminderInterval: 240, // minutes
    emailNotifications: true,
    darkModeDefault: false
  })

  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: ''
  })

  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const handleInputChange = (category, field, value) => {
    if (category) {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings))
    setSaveMessage('Settings saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert('Please enter both holiday name and date')
      return
    }

    const updatedHolidays = [...settings.holidays, newHoliday]
    setSettings(prev => ({
      ...prev,
      holidays: updatedHolidays
    }))

    setNewHoliday({ name: '', date: '' })
  }

  const handleDeleteHoliday = (index) => {
    const updatedHolidays = settings.holidays.filter((_, i) => i !== index)
    setSettings(prev => ({
      ...prev,
      holidays: updatedHolidays
    }))
  }

  const handleResetSettings = () => {
    if (!window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      return
    }

    const defaultSettings = {
      companyName: 'HR System',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      leavePolicies: {
        vacation: 15,
        sick: 10,
        personal: 5
      },
      holidays: [],
      autoLogoutEnabled: true,
      breakRemindersEnabled: true,
      breakReminderInterval: 240,
      emailNotifications: true,
      darkModeDefault: false
    }

    setSettings(defaultSettings)
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings))
    alert('Settings reset to default successfully!')
  }

  const handleExportData = () => {
    const allData = {
      users: JSON.parse(localStorage.getItem('systemUsers') || '[]'),
      leaveRequests: JSON.parse(localStorage.getItem('allLeaveRequests') || '[]'),
      timeCorrectionRequests: JSON.parse(localStorage.getItem('timeCorrectionRequests') || '[]'),
      settings: settings
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hr_system_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Check if user is employee
  const isEmployee = userRole === 'employee'

  // Get remaining leaves for employee
  const getRemainingLeaves = () => {
    return {
      vacation: settings.leavePolicies.vacation,
      sick: settings.leavePolicies.sick,
      personal: settings.leavePolicies.personal,
      total: settings.leavePolicies.vacation + settings.leavePolicies.sick + settings.leavePolicies.personal
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">
            {isEmployee ? 'My Settings' : 'System Settings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEmployee ? 'View company information and policies' : 'Configure system preferences and policies'}
          </p>
        </div>
        {!isEmployee && (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-[#e29578] hover:bg-[#d28468] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              onClick={handleExportData}
            >
              📥 Export Data
            </button>
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              onClick={handleResetSettings}
            >
              🔄 Reset to Default
            </button>
          </div>
        )}
      </div>

      {saveMessage && !isEmployee && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-4 rounded-lg">
          {saveMessage}
        </div>
      )}

      {/* Employee Read-Only Sections */}
      {isEmployee && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Working Hours - Read Only */}
            <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">⏰ Working Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Start Time</span>
                  <span className="text-[#006d77] dark:text-[#83c5be] font-bold">{settings.workingHours.start}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">End Time</span>
                  <span className="text-[#006d77] dark:text-[#83c5be] font-bold">{settings.workingHours.end}</span>
                </div>
              </div>
            </div>

            {/* Remaining Leaves - Read Only */}
            <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">📅 Annual Leave Balance</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg flex items-center gap-3">
                  <div className="text-3xl">🏖️</div>
                  <div className="text-white">
                    <div className="text-xs opacity-90">Vacation Days</div>
                    <div className="text-xl font-bold">{getRemainingLeaves().vacation} days</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg flex items-center gap-3">
                  <div className="text-3xl">🏥</div>
                  <div className="text-white">
                    <div className="text-xs opacity-90">Sick Leave</div>
                    <div className="text-xl font-bold">{getRemainingLeaves().sick} days</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg flex items-center gap-3">
                  <div className="text-3xl">👤</div>
                  <div className="text-white">
                    <div className="text-xs opacity-90">Personal Days</div>
                    <div className="text-xl font-bold">{getRemainingLeaves().personal} days</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#006d77] to-[#83c5be] p-3 rounded-lg flex items-center gap-3">
                  <div className="text-3xl">📊</div>
                  <div className="text-white">
                    <div className="text-xs opacity-90">Total Available</div>
                    <div className="text-xl font-bold">{getRemainingLeaves().total} days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Holidays - Read Only */}
          <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">🏖️ Company Holidays</h2>
            <div className="space-y-3">
              {settings.holidays.length === 0 ? (
                <div className="text-center p-8 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-500 dark:text-gray-400">
                  No holidays scheduled yet
                </div>
              ) : (
                settings.holidays.map((holiday, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg border-l-4 border-[#006d77] dark:border-[#83c5be]">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{holiday.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {!isEmployee && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Company Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleInputChange(null, 'companyName', e.target.value)}
                placeholder="Enter company name"
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Working Hours</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
              <input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => handleInputChange('workingHours', 'start', e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Time</label>
              <input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => handleInputChange('workingHours', 'end', e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
          </div>
        </div>

        {/* Leave Policies */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Leave Policies (Days per Year)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vacation Days</label>
              <input
                type="number"
                min="0"
                value={settings.leavePolicies.vacation}
                onChange={(e) => handleInputChange('leavePolicies', 'vacation', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sick Leave Days</label>
              <input
                type="number"
                min="0"
                value={settings.leavePolicies.sick}
                onChange={(e) => handleInputChange('leavePolicies', 'sick', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Personal Days</label>
              <input
                type="number"
                min="0"
                value={settings.leavePolicies.personal}
                onChange={(e) => handleInputChange('leavePolicies', 'personal', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
              />
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">System Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
              <input
                type="checkbox"
                checked={settings.autoLogoutEnabled}
                onChange={(e) => handleInputChange(null, 'autoLogoutEnabled', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#006d77] rounded focus:ring-[#83c5be]"
              />
              <div className="flex-1">
                <label className="font-semibold text-gray-800 dark:text-gray-200">Enable Auto-Logout at Midnight</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Automatically log out employees at the end of the day</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
              <input
                type="checkbox"
                checked={settings.breakRemindersEnabled}
                onChange={(e) => handleInputChange(null, 'breakRemindersEnabled', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#006d77] rounded focus:ring-[#83c5be]"
              />
              <div className="flex-1">
                <label className="font-semibold text-gray-800 dark:text-gray-200">Enable Break Reminders</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Remind employees to take breaks</p>
              </div>
            </div>
            {settings.breakRemindersEnabled && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Break Reminder Interval (minutes)</label>
                <input
                  type="number"
                  min="30"
                  step="30"
                  value={settings.breakReminderInterval}
                  onChange={(e) => handleInputChange(null, 'breakReminderInterval', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                />
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange(null, 'emailNotifications', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#006d77] rounded focus:ring-[#83c5be]"
              />
              <div className="flex-1">
                <label className="font-semibold text-gray-800 dark:text-gray-200">Enable Email Notifications</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Send email notifications for important events</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
              <input
                type="checkbox"
                checked={settings.darkModeDefault}
                onChange={(e) => handleInputChange(null, 'darkModeDefault', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#006d77] rounded focus:ring-[#83c5be]"
              />
              <div className="flex-1">
                <label className="font-semibold text-gray-800 dark:text-gray-200">Dark Mode by Default</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable dark mode for new users by default</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holidays Section */}
      <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Company Holidays</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Holiday name"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
          />
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
            className="flex-1 px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
          />
          <button
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
            onClick={handleAddHoliday}
          >
            + Add Holiday
          </button>
        </div>

        <div className="space-y-3">
          {settings.holidays.length === 0 ? (
            <div className="text-center p-8 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-500 dark:text-gray-400">
              No holidays added yet
            </div>
          ) : (
            settings.holidays.map((holiday, index) => (
              <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg border-l-4 border-[#006d77] dark:border-[#83c5be]">
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">{holiday.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(holiday.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  onClick={() => handleDeleteHoliday(index)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
        </>
      )}

      {/* Save Button - Only for Admin/Manager */}
      {!isEmployee && (
        <div className="flex justify-center pt-6">
          <button
            className="px-8 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={handleSaveSettings}
          >
            💾 Save All Settings
          </button>
        </div>
      )}
    </div>
  )
}

export default Settings
