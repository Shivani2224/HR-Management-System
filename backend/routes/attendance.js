import express from 'express';
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendance,
  getActiveSession
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

router.post('/checkin', checkIn);
router.put('/checkout', checkOut);
router.put('/break-start', startBreak);
router.put('/break-end', endBreak);
router.get('/', getAttendance);
router.get('/active', getActiveSession);

export default router;
