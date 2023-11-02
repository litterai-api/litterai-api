import { fileURLToPath } from 'url';
import Joi from 'joi';

import logError from '../../Errors/log-error.js';
import categoryLeaderboardService from '../../services/leaderboard/category-leaderboard.js';

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
  let user;
  if (req.user) {
    user = req.user;
  }

  // Validate request body
  try {
    const { error } = paramSchema.validate(category);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    // Execute service
    const result = await categoryLeaderboardService(
      category,
      page,
      perPage,
      user,
    );

    // Return successful request
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);

    // Log the error
    logError(error, __filename, 'postRegister');

    // If a custom error was created use it
    if (error.statusCode) {
      return res.status(error.statusCode).send({ message: error.message });
    }
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};

export default getLeaderboardByCategory;
