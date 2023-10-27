import { fileURLToPath } from 'url';
import Joi from 'joi';

import leaderboardModel from '../../models/leaderboard/index.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const paramSchema = Joi.string()
  .valid(
    'paper',
    'cardboard',
    'compost',
    'metal',
    'glass',
    'plastic',
    'trash',
    'other',
    'unknown',
  )
  .required();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getLeaderboardByCategory = async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = parseInt(req.query.perPage, 10) || 10;
  console.log(typeof page, typeof perPage);
  let user;
  if (req.user) {
    user = req.user;
  }

  try {
    const { error } = paramSchema.validate(category);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    const { code, data } = await leaderboardModel.leaderboardByCategory(
      category,
      page,
      perPage,
      user,
    );
    return res.status(code).send(data);
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default getLeaderboardByCategory;
