import registerUserService from '../../services/auth/register-user.js';

import { registerSchema } from './authReqBodySchemas.js';

const postRegister = async (req, res, next) => {
  // TODO: add rate limiting
  // TODO: add captcha
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
    return next(error);
  }
};
export default postRegister;
