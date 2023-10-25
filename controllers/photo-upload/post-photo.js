import { fileURLToPath } from 'url';

// import authModel from '../../models/auth/index.js';
import postPhotoBodySchema from './photoReqBodySchemas.js';
import logError from '../../Errors/log-error.js';
import photoModel from '../../models/photo/index.js';

const __filename = fileURLToPath(import.meta.url);
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const postPhoto = async (req, res) => {
  const { category, email } = req.body;
  try {
    const { error } = postPhotoBodySchema.validate(req.body);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    if (email !== req.user.email) {
      return res.status(401).send({ message: 'Invalid email or token.' });
    }
    const { code, data } = await photoModel.addPhoto(category, req.user);
    return res.status(code).send(data);
  } catch (error) {
    console.log(error);
    logError(error, __filename, 'postPhoto');
    return res.status(500).send({ message: 'Internal Service Error.' });
  }
};

export default postPhoto;
