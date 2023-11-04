import { loginSchema } from './authReqBodySchemas.js';
import loginUserService from '../../services/auth/login-user.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const postLogin = async (req, res, next) => {
  // TODO: add delay methods
  // TODO: add lockout method
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    const result = await loginUserService(req.body);

    return res.status(201).send(result);
  } catch (error) {
    return next(error);
  }
};

export default postLogin;
