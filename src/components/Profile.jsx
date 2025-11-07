import { useState, useEffect } from 'react'
import './Profile.css'

function Profile({ username, userRole }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: username,
    email: '',
    phone: '',
    address: '',
    department: '',
    joinDate: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [leaveBalance, setLeaveBalance] = useState({
    vacation: 15,
    sick: 10,
    personal: 5,
    total: 30
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    loadProfileData()
    calculateLeaveBalance()
  }, [username])

  const loadProfileData = () => {
    const saved = localStorage.getItem(`profile_${username}`)
    if (saved) {
      setProfileData(JSON.parse(saved))
    } else {
      // Set default data
      const defaultData = {
        name: username,
        email: `${username.toLowerCase().replace(' ', '.')}@company.com`,
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
        department: userRole === 'employee' ? 'Operations' : userRole === 'manager' ? 'Management' : 'Administration',
        joinDate: '2023-01-15',
        emergencyContact: 'Emergency Contact',
        emergencyPhone: '+1 (555) 987-6543'
      }
      setProfileData(defaultData)
      localStorage.setItem(`profile_${username}`, JSON.stringify(defaultData))
    }
  }

  const calculateLeaveBalance = () => {
    const leaveRequests = JSON.parse(localStorage.getItem(`leaveRequests_${username}`) || '[]')

    // Calculate used leave days
    const usedLeave = {
      vacation: 0,
      sick: 0,
      personal: 0
    }

    leaveRequests.forEach(request => {
      if (request.status === 'approved') {
        if (usedLeave[request.type] !== undefined) {
          usedLeave[request.type] += request.days
        }
      }
    })

    // Calculate remaining balance
    const balance = {
      vacation: 15 - usedLeave.vacation,
      sick: 10 - usedLeave.sick,
      personal: 5 - usedLeave.personal
    }
    balance.total = balance.vacation + balance.sick + balance.personal

    setLeaveBalance(balance)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    localStorage.setItem(`profile_${username}`, JSON.stringify(profileData))
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const handleCancel = () => {
    loadProfileData()
    setIsEditing(false)
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')

    // Find current user
    const userIndex = users.findIndex(u => u.name === username)

    if (userIndex === -1) {
      setPasswordError('User not found')
      return
    }

    // Verify current password
    if (users[userIndex].password !== passwordData.currentPassword) {
      setPasswordError('Current password is incorrect')
      return
    }

    // Update password
    users[userIndex].password = passwordData.newPassword
    localStorage.setItem('systemUsers', JSON.stringify(users))

    // Clear form and show success
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordSuccess('Password changed successfully!')

    // Hide success message after 3 seconds
    setTimeout(() => {
      setPasswordSuccess('')
    }, 3000)
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and view leave balance</p>
      </div>

      <div className="profile-content">
        {/* Leave Balance Section */}
        <div className="leave-balance-section">
          <h2>Leave Balance</h2>
          <div className="balance-cards">
            <div className="balance-card vacation">
              <div className="balance-icon">🏖️</div>
              <div className="balance-info">
                <div className="balance-type">Vacation</div>
                <div className="balance-value">{leaveBalance.vacation} days</div>
              </div>
            </div>

            <div className="balance-card sick">
              <div className="balance-icon">🤒</div>
              <div className="balance-info">
                <div className="balance-type">Sick Leave</div>
                <div className="balance-value">{leaveBalance.sick} days</div>
              </div>
            </div>

            <div className="balance-card personal">
              <div className="balance-icon">📅</div>
              <div className="balance-info">
                <div className="balance-type">Personal</div>
                <div className="balance-value">{leaveBalance.personal} days</div>
              </div>
            </div>

            <div className="balance-card total">
              <div className="balance-icon">📊</div>
              <div className="balance-info">
                <div className="balance-type">Total</div>
                <div className="balance-value">{leaveBalance.total} days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="profile-info-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  ✓ Save
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  ✗ Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.name}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.email}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.phone}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.department}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Join Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="joinDate"
                      value={profileData.joinDate}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{new Date(profileData.joinDate).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Role</label>
                  <div className="field-value">
                    <span className="role-badge">{userRole}</span>
                  </div>
                </div>
              </div>

              <div className="form-field full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                ) : (
                  <div className="field-value">{profileData.address}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.emergencyContact}</div>
                  )}
                </div>

                <div className="form-field">
                  <label>Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={profileData.emergencyPhone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="field-value">{profileData.emergencyPhone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="password-change-section">
          <div className="section-header">
            <h2>Change Password</h2>
          </div>

          <div className="password-form">
            {passwordError && (
              <div className="password-error">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="password-success">
                {passwordSuccess}
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-field">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button className="change-password-btn" onClick={handleChangePassword}>
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
