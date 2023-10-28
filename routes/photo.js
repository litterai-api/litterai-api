import express from 'express';

import photoController from '../controllers/photo-upload/index.js';
import getUserPhotoCount from '../controllers/photo-upload/get-user-photo-count.js';

const photoRoutes = express.Router();

photoRoutes.post('/', photoController.postPhoto);

photoRoutes.get('/:username', getUserPhotoCount);

export default photoRoutes;
