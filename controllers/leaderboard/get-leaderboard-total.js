import Joi from 'joi';

import leaderboardModel from '../../models/leaderboard/index.js';

const getLeaderboardTotalSchema = Joi.object({
  page: Joi.number().min(1).max(1000),
  perPage: Joi.number().min(1).max(50),
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const getLeaderboardByTotal = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = parseInt(req.query.perPage, 10) || 10;
  let user;
  if (req.user) {
    user = req.user;
  }

  try {
    const { error } = getLeaderboardTotalSchema.validate({ page, perPage });
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    const { code, data } = await leaderboardModel.leaderboardByTotal(
      page,
      perPage,
      user,
    );

    return res.status(code).send(data);
  } catch (error) {
    return next(error);
  }
};

export default getLeaderboardByTotal;
