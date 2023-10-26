import { fileURLToPath } from 'url';
import logError from '../../Errors/log-error.js';
import authModel from '../../models/auth/index.js';
import { registerSchema } from './authReqBodySchemas.js';

const __filename = fileURLToPath(import.meta.url);
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const postRegister = async (req, res) => {
  try {
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
    const { code, data } = await authModel.register(req.body);
    return res.status(code).send(data);
  } catch (error) {
    console.log('ERROR: ', error);
    logError(error, __filename, 'postRegister');
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};
export default postRegister;
