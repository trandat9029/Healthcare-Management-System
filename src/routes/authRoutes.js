// routes/authRoutes.js

import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Đăng ký người dùng
// router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.handleLogin);

export default router;