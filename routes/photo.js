import express from 'express';

import photoController from '../controllers/photo-info/index.js';
import isAuth from '../middleware/isAuth.js';

const photoRoutes = express.Router();

photoRoutes.post('/', isAuth, photoController.postPhoto);

photoRoutes.get('/:userId', isAuth, photoController.getUserPhotoCount);

export default photoRoutes;
