import express from 'express';
import doctorController from '../controllers/doctorController';

const router = express.Router();

        router.get('/', doctorController.getListPatientForDoctor);

        
        
export default router;