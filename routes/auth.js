import express from 'express';

import authController from '../controllers/auth/index.js';

const authRoutes = express.Router();

authRoutes.post('/register', authController.postRegister);

authRoutes.post('/login', authController.postLogin);

export default authRoutes;
