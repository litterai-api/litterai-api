// Remember to check the blacklist

import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import { getBlacklistCollection } from '../DB/collections.js';
import logError from '../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

/**
 * @type {import('mongodb').Collection}
 */
const blacklistCollection = getBlacklistCollection;

const { JWT_SECRET } = process.env;
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const isAuth = async (req, res, next) => {
  const authTokenSchema = Joi.string().pattern(/^Bearer /);

  const authHeader = req.get('Authorization');
  console.log(authHeader);
  if (!authHeader) {
    return res.status(422).send({
      message: 'Authentication token is required for this endpoint.',
    });
  }

  const { error } = authTokenSchema.validate(authHeader);
  if (error) {
    return res
      .status(422)
      .send({ message: "Authorization header must begin with 'Bearer'" });
  }

  const authToken = authHeader.split(' ')[1];

  try {
    if (await blacklistCollection.findOne({ token: authToken })) {
      return res.status(498).send({ message: 'Invalid Token' });
    }
  } catch (err) {
    console.log(err);
    logError(err, __filename, 'isAuth');
    return res.status(500).send({ message: 'Internal Service Error' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, JWT_SECRET);
  } catch (err) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  if (!decodedToken) {
    return res.status(498).send({ message: 'Unauthorized' });
  }

  req.user = decodedToken;
  return next();
};

export default isAuth;
