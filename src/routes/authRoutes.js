// routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';


const router = express.Router();

router.post('/login', authController.handleLogin);
router.post('/refresh-token', authController.handleRefreshToken);
router.post('/logout', authController.handleLogout);

    router.post('/forgot-password/send-otp', authController.handleSendOtp);

    router.post("/forgot-password/verify-otp", authController.handleVerifyOtp);

    router.post("/forgot-password/reset-password", authController.handleResetPassword);


export default router;