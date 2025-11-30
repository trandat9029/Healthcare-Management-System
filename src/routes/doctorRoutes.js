import express from 'express';
import doctorController from '../controllers/doctorController';

const router = express.Router();

     router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    
        router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    
        router.post('/api/save-info-doctors', doctorController.postInfoDoctor);
    
        router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    
        router.get('/api/get-extra-info-doctor-by-id', doctorController.getExtraInfoDoctorById);
    
        router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    


export default router;