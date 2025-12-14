// routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';


const router = express.Router();

router.post('/login', authController.handleLogin);
router.post('/refresh-token', authController.handleRefreshToken);
router.post('/logout', authController.handleLogout);

export default router;