import { fileURLToPath } from 'url';
import logError from '../../Errors/log-error.js';
import authModel from '../../models/auth/index.js';
import { getUserCollection } from '../../DB/collections.js';

import { registerSchema } from './authReqBodySchemas.js';

const __filename = fileURLToPath(import.meta.url);
const userCollection = getUserCollection;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const postRegister = async (req, res) => {
  const { username, email } = req.body;
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

    // Check is username or email is already in use
    if (
      (await userCollection.findOne({
        username: username.toLowerCase().trim(),
      })) ||
      (await userCollection.findOne({ email: email.toLowerCase().trim() }))
    ) {
      return res
        .status(409)
        .send({ message: 'Username or Email already in use' });
    }
    // Run the user
    const { code, data } = await authModel.register(req.body);
    return res.status(code).send(data);
  } catch (error) {
    console.log('ERROR: ', error);
    logError(error, __filename, 'postRegister');
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};
export default postRegister;
