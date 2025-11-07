import { useState, useEffect } from 'react'
import './Settings.css'

function Settings() {
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

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1>System Settings</h1>
          <p>Configure system preferences and policies</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExportData}>
            📥 Export Data
          </button>
          <button className="btn-reset" onClick={handleResetSettings}>
            🔄 Reset to Default
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="save-message">{saveMessage}</div>
      )}

      <div className="settings-grid">
        {/* Company Settings */}
        <div className="settings-section">
          <h2>Company Settings</h2>
          <div className="setting-item">
            <label>Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleInputChange(null, 'companyName', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
        </div>

        {/* Working Hours */}
        <div className="settings-section">
          <h2>Working Hours</h2>
          <div className="setting-item">
            <label>Start Time</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => handleInputChange('workingHours', 'start', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>End Time</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => handleInputChange('workingHours', 'end', e.target.value)}
            />
          </div>
        </div>

        {/* Leave Policies */}
        <div className="settings-section">
          <h2>Leave Policies (Days per Year)</h2>
          <div className="setting-item">
            <label>Vacation Days</label>
            <input
              type="number"
              min="0"
              value={settings.leavePolicies.vacation}
              onChange={(e) => handleInputChange('leavePolicies', 'vacation', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Sick Leave Days</label>
            <input
              type="number"
              min="0"
              value={settings.leavePolicies.sick}
              onChange={(e) => handleInputChange('leavePolicies', 'sick', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Personal Days</label>
            <input
              type="number"
              min="0"
              value={settings.leavePolicies.personal}
              onChange={(e) => handleInputChange('leavePolicies', 'personal', parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* System Preferences */}
        <div className="settings-section">
          <h2>System Preferences</h2>
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.autoLogoutEnabled}
                onChange={(e) => handleInputChange(null, 'autoLogoutEnabled', e.target.checked)}
              />
              Enable Auto-Logout at Midnight
            </label>
            <p className="setting-description">Automatically log out employees at the end of the day</p>
          </div>
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.breakRemindersEnabled}
                onChange={(e) => handleInputChange(null, 'breakRemindersEnabled', e.target.checked)}
              />
              Enable Break Reminders
            </label>
            <p className="setting-description">Remind employees to take breaks</p>
          </div>
          {settings.breakRemindersEnabled && (
            <div className="setting-item">
              <label>Break Reminder Interval (minutes)</label>
              <input
                type="number"
                min="30"
                step="30"
                value={settings.breakReminderInterval}
                onChange={(e) => handleInputChange(null, 'breakReminderInterval', parseInt(e.target.value))}
              />
            </div>
          )}
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange(null, 'emailNotifications', e.target.checked)}
              />
              Enable Email Notifications
            </label>
            <p className="setting-description">Send email notifications for important events</p>
          </div>
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.darkModeDefault}
                onChange={(e) => handleInputChange(null, 'darkModeDefault', e.target.checked)}
              />
              Dark Mode by Default
            </label>
            <p className="setting-description">Enable dark mode for new users by default</p>
          </div>
        </div>
      </div>

      {/* Holidays Section */}
      <div className="settings-section full-width">
        <h2>Company Holidays</h2>
        <div className="holiday-add-section">
          <input
            type="text"
            placeholder="Holiday name"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
          />
          <button className="btn-add-holiday" onClick={handleAddHoliday}>
            + Add Holiday
          </button>
        </div>

        <div className="holidays-list">
          {settings.holidays.length === 0 ? (
            <div className="no-holidays">No holidays added yet</div>
          ) : (
            settings.holidays.map((holiday, index) => (
              <div key={index} className="holiday-item">
                <div className="holiday-info">
                  <span className="holiday-name">{holiday.name}</span>
                  <span className="holiday-date">
                    {new Date(holiday.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <button className="btn-delete-holiday" onClick={() => handleDeleteHoliday(index)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-footer">
        <button className="btn-save-settings" onClick={handleSaveSettings}>
          💾 Save All Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
