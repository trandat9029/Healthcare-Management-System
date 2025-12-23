import express from "express";
import doctorController from "../controllers/doctorController";
import { protectedRoute } from "../middleware/authMiddleware";

const router = express.Router();

        router.get("/out-standing", doctorController.getTopDoctorHome);

        router.get("/all", doctorController.getAllDoctors);

        router.post("/", protectedRoute, doctorController.postInfoDoctor);

        router.get("/detail", doctorController.getDetailDoctorById);

        router.get("/extra-info", doctorController.getExtraInfoDoctorById);

        router.get("/profile", protectedRoute, doctorController.getProfileDoctorById);

        router.put("/profile", protectedRoute, doctorController.handleUpdateProfile);

        router.post('/cancel-booking', doctorController.handleCancelBooked);

export default router;
