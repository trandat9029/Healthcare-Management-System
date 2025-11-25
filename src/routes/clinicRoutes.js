// routes/authRoutes.js

import express from 'express';
import clinicController from '../controllers/clinicController.js';

const router = express.Router();

// Đăng ký người dùng
// router.post('/register', authController.register);

// Đăng nhập
router.post('/api/create-new-clinic', clinicController.createClinic);

router.get('/api/get-clinic', clinicController.getAllClinic);

router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);


export default router;