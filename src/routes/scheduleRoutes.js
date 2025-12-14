import express from 'express';
import doctorController from '../controllers/doctorController';
import { protectedRoute } from '../middleware/authMiddleware';
const router = express.Router();

            router.get('/all', doctorController.handleGetAllSchedule);

            router.get('/', doctorController.handleGetScheduleByDoctor);

            router.post('/', protectedRoute, doctorController.bulkCreateSchedule);
        
            router.get('/schedule-by-date', doctorController.getScheduleByDate);

export default router;