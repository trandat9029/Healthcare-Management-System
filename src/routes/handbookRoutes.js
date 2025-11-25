// routes/authRoutes.js

import express from 'express';
import handbookController from '../controllers/handbookController';

const router = express.Router();

// Handbook routes

router.post('/handbook', handbookController.handleCreateHandbook);

router.get('/handbooks', handbookController.handleGetAllHandbook);

router.get('/handbook/detail', handbookController.handleGetDetailHandbookById);


export default router;