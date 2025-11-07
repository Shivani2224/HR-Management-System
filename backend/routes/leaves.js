import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, isManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get leave requests
router.get('/', async (req, res) => {
  try {
    let queryText = 'SELECT * FROM leave_requests';
    const params = [];

    if (req.user.role === 'employee') {
      queryText += ' WHERE user_id = $1';
      params.push(req.user.userId);
    }

    queryText += ' ORDER BY submitted_date DESC';

    const result = await query(queryText, params);
    res.json({ leaves: result.rows });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit leave request
router.post('/', async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.userId;

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    const result = await query(
      `INSERT INTO leave_requests (user_id, type, start_date, end_date, days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, type, startDate, endDate, days, reason]
    );

    res.status(201).json({ leave: result.rows[0] });
  } catch (error) {
    console.error('Submit leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject leave
router.put('/:id/status', isManagerOrAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const result = await query(
      `UPDATE leave_requests
       SET status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_date = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, rejectionReason, req.user.userId, req.params.id]
    );

    res.json({ leave: result.rows[0] });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
