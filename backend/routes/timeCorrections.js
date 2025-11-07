import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, isManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get time correction requests
router.get('/', async (req, res) => {
  try {
    let queryText = 'SELECT * FROM time_corrections';

    if (req.user.role === 'employee') {
      queryText += ' WHERE user_id = $1';
      const result = await query(queryText, [req.user.userId]);
      return res.json({ corrections: result.rows });
    }

    const result = await query(queryText + ' ORDER BY submitted_date DESC');
    res.json({ corrections: result.rows });
  } catch (error) {
    console.error('Get corrections error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit correction request
router.post('/', async (req, res) => {
  try {
    const { attendanceId, newLoginTime, newLogoutTime, reason } = req.body;

    const result = await query(
      `INSERT INTO time_corrections (user_id, attendance_id, new_login_time, new_logout_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.userId, attendanceId, newLoginTime, newLogoutTime, reason]
    );

    res.status(201).json({ correction: result.rows[0] });
  } catch (error) {
    console.error('Submit correction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject correction
router.put('/:id/status', isManagerOrAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const result = await query(
      `UPDATE time_corrections
       SET status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_date = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, rejectionReason, req.user.userId, req.params.id]
    );

    // If approved, update the attendance record
    if (status === 'approved') {
      const correction = result.rows[0];
      await query(
        `UPDATE attendance
         SET login_time = $1, logout_time = $2
         WHERE id = $3`,
        [correction.new_login_time, correction.new_logout_time, correction.attendance_id]
      );
    }

    res.json({ correction: result.rows[0] });
  } catch (error) {
    console.error('Update correction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
