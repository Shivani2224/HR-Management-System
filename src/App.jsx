import { useState, useEffect } from 'react'
import Login from './components/Login'
import Navbar from './components/Navbar'
import EmployeeDashboard from './components/EmployeeDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import AdminDashboard from './components/AdminDashboard'
import UserManagement from './components/UserManagement'
import EmployeeDirectory from './components/EmployeeDirectory'
import Reports from './components/Reports'
import Settings from './components/Settings'
import LeaveRequest from './components/LeaveRequest'
import LeaveApproval from './components/LeaveApproval'
import AttendanceHistory from './components/AttendanceHistory'
import Payslips from './components/Payslips'
import Profile from './components/Profile'
import TimeCorrection from './components/TimeCorrection'
import TimeCorrectionApproval from './components/TimeCorrectionApproval'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  // Apply dark mode class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const handleLogin = (username, role) => {
    setUser({ username, role })
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('dashboard')
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  return (
    <div className={`min-h-screen ${user ? 'bg-[#f5f6fa] dark:bg-[#16213e]' : 'flex justify-center items-center p-5'}`}>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            currentView={currentView}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <div className="p-[30px] max-w-[1400px] mx-auto">
            {user.role === 'employee' && (
              <>
                {currentView === 'dashboard' && <EmployeeDashboard user={user} />}
                {currentView === 'leave-requests' && <LeaveRequest username={user.username} userRole={user.role} />}
                {currentView === 'attendance' && <AttendanceHistory username={user.username} />}
                {currentView === 'time-correction' && <TimeCorrection username={user.username} userRole={user.role} />}
                {currentView === 'payslips' && <Payslips username={user.username} userRole={user.role} />}
                {currentView === 'profile' && <Profile username={user.username} userRole={user.role} />}
              </>
            )}
            {user.role === 'manager' && (
              <>
                {currentView === 'dashboard' && <ManagerDashboard user={user} onNavigate={handleNavigate} />}
                {currentView === 'leave-requests' && <LeaveRequest username={user.username} userRole={user.role} />}
                {currentView === 'leave-approval' && <LeaveApproval userRole={user.role} />}
                {currentView === 'attendance' && <AttendanceHistory username={user.username} />}
                {currentView === 'time-correction' && <TimeCorrection username={user.username} userRole={user.role} />}
                {currentView === 'time-correction-approval' && <TimeCorrectionApproval userRole={user.role} />}
                {currentView === 'payslips' && <Payslips username={user.username} userRole={user.role} />}
                {currentView === 'profile' && <Profile username={user.username} userRole={user.role} />}
                {currentView === 'employees' && <EmployeeDirectory />}
                {currentView === 'reports' && <Reports />}
                {currentView === 'settings' && <Settings userRole={user.role} />}
              </>
            )}
            {user.role === 'admin' && (
              <>
                {currentView === 'dashboard' && <AdminDashboard user={user} onNavigate={handleNavigate} />}
                {currentView === 'leave-approval' && <LeaveApproval userRole={user.role} />}
                {currentView === 'time-correction-approval' && <TimeCorrectionApproval userRole={user.role} />}
                {currentView === 'employees' && <EmployeeDirectory />}
                {currentView === 'reports' && <Reports />}
                {currentView === 'settings' && <Settings userRole={user.role} />}
                {currentView === 'users' && <UserManagement />}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
