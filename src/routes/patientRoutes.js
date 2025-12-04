import express from 'express';
import doctorController from '../controllers/doctorController';

const router = express.Router();

        router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor);

        
        
export default router;