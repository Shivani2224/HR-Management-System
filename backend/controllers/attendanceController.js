import { query } from '../config/database.js';

/**
 * Clock in (start work session)
 * POST /api/attendance/checkin
 */
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const loginTime = new Date();
    const date = loginTime.toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await query(
      'SELECT id FROM attendance WHERE user_id = $1 AND date = $2 AND logout_time IS NULL',
      [userId, date]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in. Please check out first.' });
    }

    // Create new attendance record
    const result = await query(
      `INSERT INTO attendance (user_id, login_time, date, total_break_time)
       VALUES ($1, $2, $3, 0)
       RETURNING *`,
      [userId, loginTime, date]
    );

    res.json({
      message: 'Checked in successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Server error during check-in' });
  }
};

/**
 * Clock out (end work session)
 * PUT /api/attendance/checkout
 */
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logoutTime = new Date();
    const date = logoutTime.toISOString().split('T')[0];

    // Find active session
    const session = await query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2 AND logout_time IS NULL',
      [userId, date]
    );

    if (session.rows.length === 0) {
      return res.status(400).json({ error: 'No active session found. Please check in first.' });
    }

    const attendance = session.rows[0];

    // If on break, end it first
    if (attendance.break_start_time) {
      const breakDuration = (logoutTime - new Date(attendance.break_start_time)) / 1000 / 60; // minutes
      const totalBreakTime = (attendance.total_break_time || 0) + breakDuration;

      await query(
        'UPDATE attendance SET break_start_time = NULL, total_break_time = $1 WHERE id = $2',
        [totalBreakTime, attendance.id]
      );
    }

    // Calculate work hours
    const totalMinutes = (logoutTime - new Date(attendance.login_time)) / 1000 / 60;
    const workMinutes = totalMinutes - (attendance.total_break_time || 0);
    const workHours = (workMinutes / 60).toFixed(2);

    // Update checkout
    const result = await query(
      `UPDATE attendance
       SET logout_time = $1, work_hours = $2
       WHERE id = $3
       RETURNING *`,
      [logoutTime, workHours, attendance.id]
    );

    res.json({
      message: 'Checked out successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Server error during check-out' });
  }
};

/**
 * Start break
 * PUT /api/attendance/break-start
 */
export const startBreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = new Date().toISOString().split('T')[0];

    // Find active session
    const session = await query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2 AND logout_time IS NULL',
      [userId, date]
    );

    if (session.rows.length === 0) {
      return res.status(400).json({ error: 'No active session. Please check in first.' });
    }

    const attendance = session.rows[0];

    if (attendance.break_start_time) {
      return res.status(400).json({ error: 'Break already started' });
    }

    // Start break
    const result = await query(
      'UPDATE attendance SET break_start_time = $1 WHERE id = $2 RETURNING *',
      [new Date(), attendance.id]
    );

    res.json({
      message: 'Break started',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({ error: 'Server error starting break' });
  }
};

/**
 * End break
 * PUT /api/attendance/break-end
 */
export const endBreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = new Date().toISOString().split('T')[0];

    // Find active session
    const session = await query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2 AND logout_time IS NULL',
      [userId, date]
    );

    if (session.rows.length === 0) {
      return res.status(400).json({ error: 'No active session found' });
    }

    const attendance = session.rows[0];

    if (!attendance.break_start_time) {
      return res.status(400).json({ error: 'No active break to end' });
    }

    // Calculate break duration
    const breakDuration = (new Date() - new Date(attendance.break_start_time)) / 1000 / 60; // minutes
    const totalBreakTime = (attendance.total_break_time || 0) + breakDuration;

    // End break
    const result = await query(
      `UPDATE attendance
       SET break_start_time = NULL, total_break_time = $1
       WHERE id = $2
       RETURNING *`,
      [totalBreakTime, attendance.id]
    );

    res.json({
      message: 'Break ended',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({ error: 'Server error ending break' });
  }
};

/**
 * Get user's attendance history
 * GET /api/attendance
 */
export const getAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit } = req.query;

    let queryText = 'SELECT * FROM attendance WHERE user_id = $1';
    const params = [userId];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND date <= $${params.length}`;
    }

    queryText += ' ORDER BY date DESC, login_time DESC';

    if (limit) {
      params.push(limit);
      queryText += ` LIMIT $${params.length}`;
    }

    const result = await query(queryText, params);

    res.json({
      attendance: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error fetching attendance' });
  }
};

/**
 * Get current active session
 * GET /api/attendance/active
 */
export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = new Date().toISOString().split('T')[0];

    const result = await query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2 AND logout_time IS NULL',
      [userId, date]
    );

    if (result.rows.length === 0) {
      return res.json({ activeSession: null });
    }

    res.json({ activeSession: result.rows[0] });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ error: 'Server error fetching active session' });
  }
};
