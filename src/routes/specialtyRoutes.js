import express from 'express';
import specialtyController from '../controllers/specialtyController';

const router = express.Router();

    router.post('/', specialtyController.createSpecialty);
    
    router.get('/', specialtyController.getAllSpecialty);
    
    router.put('/', specialtyController.handleUpdateSpecialty);
    
    router.delete('/', specialtyController.handleDeleteSpecialty);
    
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);

export default router;