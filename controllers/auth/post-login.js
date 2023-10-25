import { fileURLToPath } from 'url';

// import authModel from '../../models/auth/index.js';
import { loginSchema } from './authReqBodySchemas.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const postLogin = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    return res.status().send();
  } catch (error) {
    console.error(error);
    logError(error, __filename, 'postLogin');
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};

export default postLogin;
