import express from 'express';
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import { protectedRoute } from '../middleware/authMiddleware';
const router = express.Router();

        router.get('/', protectedRoute, doctorController.getListPatientForDoctor);
        
        router.get('/all', patientController.handleGetAllPatient);

        router.get('/patient-by-clinic', patientController.handleGetPatientByClinic);

        router.get('/patient-by-date', patientController.handleGetPatientByDate);

export default router;