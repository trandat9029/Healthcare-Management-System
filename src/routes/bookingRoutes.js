import express from 'express';
import patientController from '../controllers/patientController';
import doctorController from '../controllers/doctorController';
import { protectedRoute } from '../middleware/authMiddleware';

const router = express.Router();

        router.post('/', protectedRoute, patientController.postBookAppointment);
    
        router.post('/verify-booking', patientController.postVerifyBookAppointment);
        
        router.post('/api/send-remedy', protectedRoute, doctorController.sendRemedy);

        router.get('/', protectedRoute, patientController.handleGetAllBooking);

        router.get('/histories', patientController.handleGetAllBookedByPatient);

        router.post('/cancel', patientController.handleSendEmailCancelBooked);

        router.post('/cancel/verify', patientController.handleVerifyCancelBooked);

export default router;