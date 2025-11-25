// routes/authRoutes.js

import express from 'express';
import handbookController from '../controllers/handbookController';

const router = express.Router();

// Handbook routes

router.post('/', handbookController.handleCreateHandbook);

router.put('/', handbookController.handleEditHandbook);

router.delete('/', handbookController.handleDeleteHandbook);

router.get('/all', handbookController.handleGetAllHandbook);

router.put('/posting', handbookController.handlePostHandbook);

router.get('/list_posted', handbookController.handleGetListPostHandbook);

router.get('/detail', handbookController.handleGetDetailHandbookById);


export default router;