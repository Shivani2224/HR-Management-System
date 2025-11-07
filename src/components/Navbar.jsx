import { useState, useEffect } from 'react'
import './Navbar.css'

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
    <nav className="navbar">
      <div className="navbar-left">
        <div className="company-name">HR System</div>
        <button className="menu-btn" onClick={toggleMenu}>
          <span className="menu-icon">☰</span>
          <span>Menu</span>
        </button>

        {isMenuOpen && (
          <div className="dropdown-menu">
            <a
              onClick={() => handleNavigate('dashboard')}
              className={currentView === 'dashboard' ? 'active' : ''}
            >
              Dashboard
            </a>
            {(user.role === 'employee' || user.role === 'manager') && (
              <>
                <a
                  onClick={() => handleNavigate('attendance')}
                  className={currentView === 'attendance' ? 'active' : ''}
                >
                  My Attendance
                </a>
                <a
                  onClick={() => handleNavigate('time-correction')}
                  className={currentView === 'time-correction' ? 'active' : ''}
                >
                  Time Correction
                </a>
                <a
                  onClick={() => handleNavigate('leave-requests')}
                  className={currentView === 'leave-requests' ? 'active' : ''}
                >
                  Leave Requests
                </a>
                <a
                  onClick={() => handleNavigate('payslips')}
                  className={currentView === 'payslips' ? 'active' : ''}
                >
                  Payslips
                </a>
                <a
                  onClick={() => handleNavigate('profile')}
                  className={currentView === 'profile' ? 'active' : ''}
                >
                  My Profile
                </a>
                <a
                  onClick={() => handleNavigate('settings')}
                  className={currentView === 'settings' ? 'active' : ''}
                >
                  Settings
                </a>
              </>
            )}
            {user.role === 'manager' && (
              <>
                <a
                  onClick={() => handleNavigate('leave-approval')}
                  className={currentView === 'leave-approval' ? 'active' : ''}
                >
                  Leave Approval
                </a>
                <a
                  onClick={() => handleNavigate('time-correction-approval')}
                  className={currentView === 'time-correction-approval' ? 'active' : ''}
                >
                  Time Correction Approval
                </a>
                <a
                  onClick={() => handleNavigate('employees')}
                  className={currentView === 'employees' ? 'active' : ''}
                >
                  Employees
                </a>
                <a
                  onClick={() => handleNavigate('reports')}
                  className={currentView === 'reports' ? 'active' : ''}
                >
                  Reports
                </a>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <a
                  onClick={() => handleNavigate('leave-approval')}
                  className={currentView === 'leave-approval' ? 'active' : ''}
                >
                  Leave Approval
                </a>
                <a
                  onClick={() => handleNavigate('time-correction-approval')}
                  className={currentView === 'time-correction-approval' ? 'active' : ''}
                >
                  Time Correction Approval
                </a>
                <a
                  onClick={() => handleNavigate('employees')}
                  className={currentView === 'employees' ? 'active' : ''}
                >
                  Employees
                </a>
                <a
                  onClick={() => handleNavigate('reports')}
                  className={currentView === 'reports' ? 'active' : ''}
                >
                  Reports
                </a>
                <a
                  onClick={() => handleNavigate('settings')}
                  className={currentView === 'settings' ? 'active' : ''}
                >
                  Settings
                </a>
                <a
                  onClick={() => handleNavigate('users')}
                  className={currentView === 'users' ? 'active' : ''}
                >
                  User Management
                </a>
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <button className="dark-mode-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="profile-section" onClick={toggleProfile}>
          <div className="profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <span className="profile-name">{displayName}</span>
            <span className="profile-role">{user.role}</span>
          </div>
          <span className="dropdown-arrow">▼</span>
        </div>

        {isProfileOpen && (
          <div className="profile-dropdown">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="profile-name-large">{displayName}</div>
                <div className="profile-role-large">{user.role}</div>
              </div>
            </div>
            <div className="profile-divider"></div>
            <a href="#profile">My Profile</a>
            <a href="#settings">Settings</a>
            <a href="#help">Help & Support</a>
            <div className="profile-divider"></div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
