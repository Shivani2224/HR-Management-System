import { useState, useEffect } from 'react'

// Predefined users - in a real app, this would be in a backend database
const defaultUsers = [
  { email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'manager@company.com', password: 'manager123', role: 'manager', name: 'Manager User' },
  { email: 'employee@company.com', password: 'employee123', role: 'employee', name: 'Employee User' },
  { email: 'john@company.com', password: 'john123', role: 'employee', name: 'John Doe' },
  { email: 'sarah@company.com', password: 'sarah123', role: 'manager', name: 'Sarah Smith' }
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Initialize users in localStorage on first load
  useEffect(() => {
    const existingUsers = localStorage.getItem('systemUsers')
    if (!existingUsers) {
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('systemUsers') || '[]')

    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      // Store current user for password change functionality
      localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.name, role: user.role }))
      onLogin(user.name, user.role)
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="w-full max-w-[450px] mx-auto">
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f3460] dark:to-[#16213e] p-10 rounded-2xl shadow-[0_20px_60px_rgba(0,109,119,0.15)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-[#edf6f9] dark:border-[rgba(131,197,190,0.2)] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 dark:before:bg-gradient-to-r dark:before:from-[#006d77] dark:before:via-[#83c5be] dark:before:to-[#e29578]">
        <h1 className="text-center bg-gradient-to-br from-[#006d77] to-[#83c5be] dark:from-[#83c5be] dark:to-[#ffddd2] bg-clip-text text-transparent mb-9 text-[32px] font-bold tracking-tight">
          HR System Login
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#fee] dark:bg-gradient-to-br dark:from-[rgba(226,149,120,0.2)] dark:to-[rgba(255,221,210,0.2)] text-[#c33] dark:text-[#ffddd2] p-3 rounded-md mb-5 text-center text-sm border border-[#fcc] dark:border-[rgba(226,149,120,0.5)] dark:border-l-4 dark:border-l-[#e29578]">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-[#006d77] dark:text-[#83c5be] font-semibold text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3.5 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg text-base transition-all bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white dark:placeholder:text-[rgba(131,197,190,0.5)] focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be] focus:bg-white dark:focus:bg-[rgba(22,33,62,0.8)] focus:shadow-[0_0_0_4px_rgba(131,197,190,0.2)] dark:focus:shadow-[0_0_0_4px_rgba(131,197,190,0.2),0_8px_20px_rgba(131,197,190,0.3)] focus:-translate-y-px dark:focus:-translate-y-0.5 dark:backdrop-blur-[10px]"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-[#006d77] dark:text-[#83c5be] font-semibold text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3.5 border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] rounded-lg text-base transition-all bg-[#edf6f9] dark:bg-[rgba(22,33,62,0.6)] dark:text-white dark:placeholder:text-[rgba(131,197,190,0.5)] focus:outline-none focus:border-[#006d77] dark:focus:border-[#83c5be] focus:bg-white dark:focus:bg-[rgba(22,33,62,0.8)] focus:shadow-[0_0_0_4px_rgba(131,197,190,0.2)] dark:focus:shadow-[0_0_0_4px_rgba(131,197,190,0.2),0_8px_20px_rgba(131,197,190,0.3)] focus:-translate-y-px dark:focus:-translate-y-0.5 dark:backdrop-blur-[10px]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-[#006d77] to-[#83c5be] dark:from-[#006d77] dark:via-[#83c5be] dark:to-[#e29578] text-white border-none py-3.5 rounded-md text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 dark:hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,109,119,0.4)] dark:hover:shadow-[0_12px_32px_rgba(131,197,190,0.6)] active:translate-y-0 relative overflow-hidden dark:shadow-[0_8px_24px_rgba(131,197,190,0.4)] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.3)] before:to-transparent before:transition-all before:duration-500 dark:hover:before:left-full"
          >
            Login
          </button>
        </form>

        <div className="mt-8 p-6 bg-gradient-to-br from-[#edf6f9] to-[#ffddd2] dark:from-[rgba(0,109,119,0.2)] dark:to-[rgba(131,197,190,0.1)] rounded-xl border-2 border-[#83c5be] dark:border-[rgba(131,197,190,0.3)] dark:backdrop-blur-[10px]">
          <p className="my-2.5 text-sm text-[#006d77] dark:text-[#ffddd2] leading-relaxed mb-4 font-bold text-[15px] dark:text-shadow-[0_0_10px_rgba(255,221,210,0.3)]">
            <strong className="text-[#e29578] font-bold">Demo Credentials:</strong>
          </p>
          <p className="my-2.5 text-sm text-[#006d77] dark:text-[#83c5be] leading-relaxed">Admin: admin@company.com / admin123</p>
          <p className="my-2.5 text-sm text-[#006d77] dark:text-[#83c5be] leading-relaxed">Manager: manager@company.com / manager123</p>
          <p className="my-2.5 text-sm text-[#006d77] dark:text-[#83c5be] leading-relaxed">Employee: employee@company.com / employee123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
