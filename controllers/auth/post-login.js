import { fileURLToPath } from 'url';
// import bcrypt from 'bcrypt';

import { loginSchema } from './authReqBodySchemas.js';
import logError from '../../Errors/log-error.js';
import loginUserService from '../../services/auth/login-user.js';

/**
 * @type {import('mongodb').Collection}
 */

const __filename = fileURLToPath(import.meta.url);
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const postLogin = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    const result = await loginUserService(req.body);
    if (!result) {
      return res.status(401).send({ message: 'Invalid Credentials' });
    }

    return res.status(201).send(result);
  } catch (error) {
    console.log(error);

    // Log the error
    logError(error, __filename, 'postLogin');

    // If a custom error was created use it
    if (error.statusCode) {
      return res.status(error.statusCode).send({ message: error.message });
    }
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};

export default postLogin;
