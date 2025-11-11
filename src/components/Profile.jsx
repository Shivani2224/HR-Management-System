import { useState, useEffect } from 'react'

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and view leave balance</p>
      </div>

      <div className="space-y-6">
        {/* Leave Balance Section */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be] mb-4">Leave Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg flex items-center gap-4 hover:shadow-lg transition-all">
              <div className="text-4xl">🏖️</div>
              <div className="text-white">
                <div className="text-sm opacity-90">Vacation</div>
                <div className="text-2xl font-bold">{leaveBalance.vacation} days</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg flex items-center gap-4 hover:shadow-lg transition-all">
              <div className="text-4xl">🤒</div>
              <div className="text-white">
                <div className="text-sm opacity-90">Sick Leave</div>
                <div className="text-2xl font-bold">{leaveBalance.sick} days</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg flex items-center gap-4 hover:shadow-lg transition-all">
              <div className="text-4xl">📅</div>
              <div className="text-white">
                <div className="text-sm opacity-90">Personal</div>
                <div className="text-2xl font-bold">{leaveBalance.personal} days</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#006d77] to-[#83c5be] p-4 rounded-lg flex items-center gap-4 hover:shadow-lg transition-all">
              <div className="text-4xl">📊</div>
              <div className="text-white">
                <div className="text-sm opacity-90">Total</div>
                <div className="text-2xl font-bold">{leaveBalance.total} days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be]">Personal Information</h2>
            {!isEditing ? (
              <button
                className="px-4 py-2 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  onClick={handleSave}
                >
                  ✓ Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  onClick={handleCancel}
                >
                  ✗ Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.department}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Join Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="joinDate"
                      value={profileData.joinDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{new Date(profileData.joinDate).toLocaleDateString()}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg">
                    <span className="px-3 py-1 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-full text-sm font-semibold capitalize">{userRole}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                  />
                ) : (
                  <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.address}</div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-[#2a3f5f]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.emergencyContact}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={profileData.emergencyPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#16213e] rounded-lg text-gray-800 dark:text-gray-200">{profileData.emergencyPhone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-[#0f3460] rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#006d77] dark:text-[#83c5be]">Change Password</h2>
          </div>

          <div className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 text-red-700 dark:text-red-400 p-4 rounded-lg">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400 text-green-700 dark:text-green-400 p-4 rounded-lg">
                {passwordSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg bg-white dark:bg-[rgba(22,33,62,0.6)] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be]"
                />
              </div>
            </div>

            <button
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
