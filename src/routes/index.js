// routes/index.js

import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import clinicRoutes from "./clinicRoutes";
import doctorRoutes from "./doctorRoutes";
import patientRoutes from "./patientRoutes";
import specialtyRoutes from "./specialtyRoutes";
import handbookRoutes from "./handbookRoutes";
import allCodeRoutes from "./allCodeRoutes";
import bookingRoutes from "./bookingRoutes";
import scheduleRoutes from "./scheduleRoutes";

// import homeRoutes from './homeRoutes.js';

const router = express.Router();

// Tổng hợp tất cả các route vào đây
router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes); // User routes
router.use("/api/clinics", clinicRoutes); // Phòng khám
router.use("/api/doctors", doctorRoutes); // Bác sĩ
router.use("/api/patients", patientRoutes); // Bệnh nhân
router.use("/api/specialties", specialtyRoutes); // Chuyên khoa
router.use("/api/handbook", handbookRoutes); // Cẩm nang
router.use("/api/allCode", allCodeRoutes); // AllCode
router.use("/api/booking", bookingRoutes); // Đặt lịch khám
router.use("/api/schedule", scheduleRoutes); // Lịch khám

export default router;
