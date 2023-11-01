import { fileURLToPath } from 'url';
import logError from '../../Errors/log-error.js';
// import authModel from '../../models/auth/index.js';
// import { getUserCollection } from '../../DB/collections.js';
import registerUserService from '../../services/auth/register-user.js';

import { registerSchema } from './authReqBodySchemas.js';

const __filename = fileURLToPath(import.meta.url);
// const userCollection = getUserCollection;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const postRegister = async (req, res) => {
  // const { username, email } = req.body;
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log(error);
      if (error.message === '"confirmPassword" must be [ref:password]') {
        return res.status(422).send({
          message: 'Validation Error',
          error: 'Passwords must match',
        });
      }
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    const result = await registerUserService(req.body);
    if (!result) {
      return res.status(500).send({ message: 'Internal Service Error' });
    }
    return res.status(201).send(result);
  } catch (error) {
    console.log('ERROR: ', error);
    logError(error, __filename, 'postRegister');
    console.log('Error MEssage: ', error.message);
    if (error.statusCode) {
      return res.status(error.statusCode).send({ message: error.message });
    }
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};
export default postRegister;
