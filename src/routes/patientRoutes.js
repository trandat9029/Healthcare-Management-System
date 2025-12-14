import express from 'express';
import doctorController from '../controllers/doctorController';
import { protectedRoute } from '../middleware/authMiddleware';
const router = express.Router();

        router.get('/', protectedRoute, doctorController.getListPatientForDoctor);

        
        
export default router;