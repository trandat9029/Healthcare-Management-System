import express from 'express';
import clinicController from '../controllers/clinicController.js';
import { protectedRoute } from '../middleware/authMiddleware';
const router = express.Router();

router.post('/', protectedRoute, clinicController.createClinic);

router.get('/', clinicController.getAllClinic);

router.get('/detail/', clinicController.getDetailClinicById);

router.put('/', protectedRoute, clinicController.handleUpdateClinic);

router.delete('/', protectedRoute, clinicController.handleDeleteClinic);


export default router;