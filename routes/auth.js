import express from 'express';

import isAuth from '../middleware/isAuth.js';

import authController from '../controllers/auth/index.js';

const authRoutes = express.Router();

authRoutes.post('/register', authController.postRegister);
authRoutes.post('/login', authController.postLogin);
authRoutes.post('/logout', isAuth, authController.postLogout);

export default authRoutes;
