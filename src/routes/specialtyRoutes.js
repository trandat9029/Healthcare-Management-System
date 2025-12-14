import express from 'express';
import specialtyController from '../controllers/specialtyController';

import { protectedRoute } from '../middleware/authMiddleware';

const router = express.Router();

    router.post('/', protectedRoute, specialtyController.createSpecialty);
    
    router.get('/', specialtyController.getAllSpecialty);
    
    router.put('/', protectedRoute, specialtyController.handleUpdateSpecialty);
    
    router.delete('/', protectedRoute, specialtyController.handleDeleteSpecialty);
    
    router.get('/detail', specialtyController.getDetailSpecialtyById);

export default router;