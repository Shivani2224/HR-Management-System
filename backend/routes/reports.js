import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, isManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, isManagerOrAdmin);

// Attendance report
router.get('/attendance', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        u.id, u.name, u.role,
        COUNT(a.id) as total_sessions,
        SUM(a.work_hours) as total_hours,
        AVG(a.work_hours) as avg_hours,
        SUM(a.total_break_time) as total_break_time
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id
       GROUP BY u.id, u.name, u.role
       ORDER BY total_hours DESC`
    );

    res.json({ report: result.rows });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave report
router.get('/leaves', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        u.id, u.name, u.role,
        COUNT(l.id) as total_requests,
        SUM(CASE WHEN l.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN l.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN l.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN l.status = 'approved' THEN l.days ELSE 0 END) as total_days_taken
       FROM users u
       LEFT JOIN leave_requests l ON u.id = l.user_id
       GROUP BY u.id, u.name, u.role
       ORDER BY total_requests DESC`
    );

    res.json({ report: result.rows });
  } catch (error) {
    console.error('Leave report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
