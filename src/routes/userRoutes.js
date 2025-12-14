// routes/userRoutes.js

import express from 'express';
import userController from '../controllers/userController';
import { protectedRoute } from '../middleware/authMiddleware';

const router = express.Router();

    // router.post('/api/login', userController.handleLogin);
    router.get('/', protectedRoute, userController.handleGetAllUsers);
    router.post('/',protectedRoute , userController.handleCreateNewUser);
    router.put('/',protectedRoute, userController.handleEditUser);
    router.delete('/',protectedRoute, userController.handleDeleteUser);




export default router;