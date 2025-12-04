import express from 'express';
import patientController from '../controllers/patientController';
import doctorController from '../controllers/doctorController';

const router = express.Router();

        router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    
        router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
        
        router.post('/api/send-remedy', doctorController.sendRemedy);

        router.get('/', patientController.handleGetAllBooking);

        router.get('/histories', patientController.handleGetAllBookedByPatient);

        router.post('/cancel', patientController.handleSendEmailCancelBooked);

        router.post('/cancel/verify', patientController.handleVerifyCancelBooked);

export default router;