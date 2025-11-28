import express from 'express';
import patientController from '../controllers/patientController';
import doctorController from '../controllers/doctorController';

const router = express.Router();

        router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    
        router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
        
        router.post('/api/send-remedy', doctorController.sendRemedy);

        router.get('/', patientController.handleGetAllBooking);

export default router;