import { fileURLToPath } from 'url';
import Joi from 'joi';

import leaderboardModel from '../../models/leaderboard/index.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const paramSchema = Joi.string().required();

// TODO: Create Validation schema
// const schema = Joi.

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

/* REMOVE THIS LINE TO UNCOMMENT CODE/////////////////////////////////////////////////////// 

const getLeaderboard = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = parseInt(req.query.perPage, 10) || 10;
  let user;
  if (req.user) {
    user = req.user;
  }

  try {
    // TODO: VALIDATE
    const { error } = paramSchema.validate();
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    const { code, data } = await leaderboardModel.leaderboardGeneral();

    return res.status(code).send(data);
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default getLeaderboardByCategory;
 */
