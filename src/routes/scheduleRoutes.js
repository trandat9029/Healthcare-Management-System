import express from 'express';
import doctorController from '../controllers/doctorController';

const router = express.Router();

            router.get('/all', doctorController.handleGetAllSchedule);

            router.get('/', doctorController.handleGetScheduleByDoctor);

            router.post('/', doctorController.bulkCreateSchedule);
        
            router.get('/api/schedule-by-date', doctorController.getScheduleByDate);

export default router;