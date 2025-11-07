import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (Admin/Manager only)
router.get('/', async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// Create user (Admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// Update user (Admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, role, password } = req.body;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET name = $1, role = $2, password_hash = $3 WHERE id = $4',
        [name, role, passwordHash, req.params.id]
      );
    } else {
      await query(
        'UPDATE users SET name = $1, role = $2 WHERE id = $3',
        [name, role, req.params.id]
      );
    }

    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.params.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

export default router;
