// routes/authRoutes.js

import express from 'express';
import handbookController from '../controllers/handbookController';
import { protectedRoute } from '../middleware/authMiddleware';
const router = express.Router();

// Handbook routes

router.post('/', protectedRoute, handbookController.handleCreateHandbook);

router.put('/', protectedRoute, handbookController.handleEditHandbook);

router.delete('/', protectedRoute, handbookController.handleDeleteHandbook);

router.get('/all', protectedRoute, handbookController.handleGetAllHandbook);

router.put('/posting', protectedRoute, handbookController.handlePostHandbook);

router.get('/list_posted', handbookController.handleGetListPostHandbook);

router.get('/detail', handbookController.handleGetDetailHandbookById);


export default router;