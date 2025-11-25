import express from 'express';
import specialtyController from '../controllers/specialtyController';

const router = express.Router();

     router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    
    router.get('/api/get-specialty', specialtyController.getAllSpecialty);
    
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);

export default router;