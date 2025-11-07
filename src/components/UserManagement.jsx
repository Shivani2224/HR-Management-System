import { useState, useEffect } from 'react'
import './UserManagement.css'

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
      case 'admin': return 'role-badge admin'
      case 'manager': return 'role-badge manager'
      case 'employee': return 'role-badge employee'
      default: return 'role-badge'
    }
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div>
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <button className="btn-add-user" onClick={handleAddUser}>
          + Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <label>Filter by Role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="user-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <div className="col">Name</div>
          <div className="col">Email</div>
          <div className="col">Role</div>
          <div className="col">Actions</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-users">No users found</div>
        ) : (
          filteredUsers.map((user, index) => (
            <div key={index} className="table-row">
              <div className="col user-name">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.name}
              </div>
              <div className="col">{user.email}</div>
              <div className="col">
                <span className={getRoleBadgeClass(user.role)}>
                  {user.role}
                </span>
              </div>
              <div className="col actions">
                <button className="btn-edit" onClick={() => handleEditUser(user)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDeleteUser(user)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                  disabled={modalMode === 'edit'}
                />
                {modalMode === 'edit' && (
                  <small>Email cannot be changed</small>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
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
