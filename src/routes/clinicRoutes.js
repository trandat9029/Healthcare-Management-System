// routes/authRoutes.js

import express from 'express';
import clinicController from '../controllers/clinicController.js';

const router = express.Router();

// Đăng ký người dùng
// router.post('/register', authController.register);

// Đăng nhập
router.post('/', clinicController.createClinic);

router.get('/', clinicController.getAllClinic);

router.get('/detail/', clinicController.getDetailClinicById);

router.put('/', clinicController.handleUpdateClinic);

router.delete('/', clinicController.handleDeleteClinic);


export default router;