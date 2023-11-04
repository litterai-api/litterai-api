import { fileURLToPath } from 'url';
import logError from '../../Errors/log-error.js';
import registerUserService from '../../services/auth/register-user.js';

import { registerSchema } from './authReqBodySchemas.js';

const __filename = fileURLToPath(import.meta.url);

const postRegister = async (req, res) => {
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

    // Create new user
    const result = await registerUserService(req.body);

    // If result is null but somehow no error was thrown
    if (!result) {
      return res
        .status(500)
        .send({ status: 'error', message: 'Internal Service Error' });
    }

    // send a response with registration data
    return res.status(201).send(result);
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
export default postRegister;
