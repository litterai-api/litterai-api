import express from 'express';

import photoController from '../controllers/photo-upload/index.js';

const photoRoutes = express.Router();

photoRoutes.post('/add', photoController.postPhoto);

export default photoRoutes;
