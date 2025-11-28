import express from 'express';
import doctorController from '../controllers/doctorController';

const router = express.Router();

            router.get('/all', doctorController.handleGetAllSchedule);

            router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
        
            router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);

export default router;