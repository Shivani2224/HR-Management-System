import { useState, useEffect } from 'react'

function Navbar({ user, onLogout, onNavigate, currentView, darkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user.username)

  // Load display name from profile if exists
  useEffect(() => {
    const profileData = localStorage.getItem(`profile_${user.username}`)
    if (profileData) {
      const profile = JSON.parse(profileData)
      setDisplayName(profile.name || user.username)
    } else {
      setDisplayName(user.username)
    }
  }, [user.username, currentView]) // Refresh when view changes (in case profile was updated)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setIsProfileOpen(false)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
    setIsMenuOpen(false)
  }

  const handleNavigate = (view) => {
    onNavigate(view)
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-[#0f3460] shadow-lg border-b-4 border-[#006d77] dark:border-[#83c5be]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 relative">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#006d77] to-[#83c5be] bg-clip-text text-transparent">
              HR System
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
              onClick={toggleMenu}
            >
              <span className="text-xl">☰</span>
              <span>Menu</span>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#0f3460] rounded-xl shadow-2xl border-2 border-[#006d77] dark:border-[#83c5be] py-2 z-50">
                <a
                  onClick={() => handleNavigate('dashboard')}
                  className={`block px-4 py-3 cursor-pointer transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                  }`}
                >
                  Dashboard
                </a>
                {(user.role === 'employee' || user.role === 'manager') && (
                  <>
                    <a
                      onClick={() => handleNavigate('attendance')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'attendance'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      My Attendance
                    </a>
                    <a
                      onClick={() => handleNavigate('time-correction')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'time-correction'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Time Correction
                    </a>
                    <a
                      onClick={() => handleNavigate('leave-requests')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'leave-requests'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Leave Requests
                    </a>
                    <a
                      onClick={() => handleNavigate('payslips')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'payslips'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Payslips
                    </a>
                  </>
                )}
                {user.role === 'manager' && (
                  <>
                    <a
                      onClick={() => handleNavigate('leave-approval')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'leave-approval'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Leave Approval
                    </a>
                    <a
                      onClick={() => handleNavigate('time-correction-approval')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'time-correction-approval'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Time Correction Approval
                    </a>
                    <a
                      onClick={() => handleNavigate('employees')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'employees'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Employees
                    </a>
                    <a
                      onClick={() => handleNavigate('reports')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'reports'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Reports
                    </a>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <a
                      onClick={() => handleNavigate('leave-approval')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'leave-approval'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Leave Approval
                    </a>
                    <a
                      onClick={() => handleNavigate('time-correction-approval')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'time-correction-approval'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Time Correction Approval
                    </a>
                    <a
                      onClick={() => handleNavigate('employees')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'employees'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Employees
                    </a>
                    <a
                      onClick={() => handleNavigate('reports')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'reports'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      Reports
                    </a>
                    <a
                      onClick={() => handleNavigate('users')}
                      className={`block px-4 py-3 cursor-pointer transition-all ${
                        currentView === 'users'
                          ? 'bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20'
                      }`}
                    >
                      User Management
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              className="p-2 rounded-lg bg-gradient-to-r from-[#006d77] to-[#83c5be] text-white hover:shadow-lg transition-all hover:-translate-y-0.5"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <div
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#006d77] to-[#83c5be] cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
              onClick={toggleProfile}
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#006d77] flex items-center justify-center font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">{displayName}</span>
                <span className="text-white/80 text-xs">{user.role}</span>
              </div>
              <span className="text-white text-xs">▼</span>
            </div>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#0f3460] rounded-xl shadow-2xl border-2 border-[#006d77] dark:border-[#83c5be] py-2 z-50">
                <div className="flex items-center gap-4 px-4 py-4 border-b-2 border-gray-200 dark:border-[#2a3f5f]">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white flex items-center justify-center font-bold text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{displayName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.role}</div>
                  </div>
                </div>
                <a
                  onClick={() => handleNavigate('profile')}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20 cursor-pointer transition-all"
                >
                  My Profile
                </a>
                {(user.role === 'manager' || user.role === 'admin') && (
                  <a
                    onClick={() => handleNavigate('settings')}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-[#83c5be]/20 cursor-pointer transition-all"
                  >
                    Settings
                  </a>
                )}
                <div className="border-t-2 border-gray-200 dark:border-[#2a3f5f] my-2"></div>
                <button
                  className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-all"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
