import express from 'express';

import photoController from '../controllers/photo-info/index.js';

const photoRoutes = express.Router();

photoRoutes.post('/', photoController.postPhoto);

photoRoutes.get('/:userId', photoController.getUserPhotoCount);

export default photoRoutes;
