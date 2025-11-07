import express from 'express';
import { login, register, changePassword, verifyToken } from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', authenticateToken, isAdmin, register);
router.put('/change-password', authenticateToken, changePassword);
router.get('/verify', authenticateToken, verifyToken);

export default router;
