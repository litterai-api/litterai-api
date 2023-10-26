import express from 'express';
import leaderboardController from '../controllers/leaderboard/index.js';
import extractUser from '../middleware/extractUser.js';

const leaderboardRoutes = express.Router();

leaderboardRoutes.get(
  '/:category',
  extractUser,
  leaderboardController.getLeaderboardByCategory,
);
export default leaderboardRoutes;
