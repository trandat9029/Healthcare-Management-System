import express from 'express';
import patientController from '../controllers/patientController';
import doctorController from '../controllers/doctorController';
import { protectedRoute } from '../middleware/authMiddleware';

const router = express.Router();

        router.post('/', patientController.postBookAppointment);
    
        router.post('/verify-booking', patientController.postVerifyBookAppointment);
        
        router.post('/send-remedy', protectedRoute, doctorController.sendRemedy);

        router.get('/', protectedRoute, patientController.handleGetAllBooking);

        router.get('/histories', patientController.handleGetAllBookedByPatient);

        router.post('/cancel', patientController.handleSendEmailCancelBooked);

        router.post('/cancel/verify', patientController.handleVerifyCancelBooked);

        router.get('/statistical', patientController.handleGetStatisticalBooking);

        router.get('/patient-by-clinic', patientController.handleGetPatientByClinic)

export default router;