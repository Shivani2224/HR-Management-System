import { useState, useEffect } from 'react'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]')
    setUsers(allUsers)
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleAddUser = () => {
    setModalMode('add')
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee'
    })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role
    })
    setShowModal(true)
  }

  const handleDeleteUser = (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return
    }

    const updatedUsers = users.filter(u => u.email !== user.email)
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
    loadUsers()
    alert('User deleted successfully!')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      alert('All fields are required!')
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters!')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address!')
      return
    }

    if (modalMode === 'add') {
      // Check if email already exists
      if (users.some(u => u.email === formData.email)) {
        alert('A user with this email already exists!')
        return
      }

      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      }

      const updatedUsers = [...users, newUser]
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
      alert('User added successfully!')
    } else {
      // Edit mode
      const updatedUsers = users.map(u => {
        if (u.email === selectedUser.email) {
          return {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          }
        }
        return u
      })

      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
      alert('User updated successfully!')
    }

    loadUsers()
    setShowModal(false)
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'manager': return 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'employee': return 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'px-3 py-1 rounded-full text-xs font-semibold'
    }
  }

  return (
    <div className="min-h-screen bg-[#ffddd2] dark:bg-[#0a1929] p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage system users and their roles</p>
        </div>
        <button
          className="bg-[#006d77] hover:bg-[#005a63] dark:bg-[#83c5be] dark:hover:bg-[#6fb3ad] text-white dark:text-[#0a1929] px-6 py-2 rounded-lg font-semibold transition-colors"
          onClick={handleAddUser}
        >
          + Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e3a4f] p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700 dark:text-gray-300 font-medium">Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="text-gray-600 dark:text-gray-300 font-medium">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1e3a4f] rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 dark:bg-[#0f3460] font-semibold text-gray-700 dark:text-gray-300">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Actions</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found</div>
        ) : (
          filteredUsers.map((user, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-[#0f3460] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006d77] dark:bg-[#83c5be] text-white dark:text-[#0a1929] flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-300">{user.email}</div>
              <div>
                <span className={getRoleBadgeClass(user.role)}>
                  {user.role}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-sm"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-sm"
                  onClick={() => handleDeleteUser(user)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1e3a4f] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be]">
                {modalMode === 'add' ? 'Add New User' : 'Edit User'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be]"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                  disabled={modalMode === 'edit'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {modalMode === 'edit' && (
                  <small className="text-gray-500 dark:text-gray-400 text-sm">Email cannot be changed</small>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be]"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0f3460] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006d77] dark:focus:ring-[#83c5be]"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f3460] transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#006d77] hover:bg-[#005a63] dark:bg-[#83c5be] dark:hover:bg-[#6fb3ad] text-white dark:text-[#0a1929] rounded-lg font-semibold transition-colors"
                >
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
