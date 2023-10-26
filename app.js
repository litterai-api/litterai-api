import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

import { getDb, mongoConnect } from './DB/db-connection.js';
import routes from './routes/index.js';
import logError from './Errors/log-error.js';
import isAuth from './middleware/isAuth.js';

const __filename = fileURLToPath(import.meta.url);

const app = express();

const PORT = process.env.API_PORT || 3000;

const startServer = async () => {
  try {
    await mongoConnect();
    const db = await getDb();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/', routes.auth);
    app.use('/leaderboard', routes.leaderboard);
    app.use(isAuth);
    app.use('/photo', routes.photo);
    app.listen(PORT, () => {
      console.log(
        `Server started on port: ${PORT}\nConnected to db: ${db.databaseName}`,
      );
    });
  } catch (error) {
    await logError(error, __filename, 'startServer');
    console.log(error);
  }
};

startServer();
