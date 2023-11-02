import { fileURLToPath } from 'url';

// import authModel from '../../models/auth/index.js';
import postPhotoBodySchema from './photoReqBodySchemas.js';
import logError from '../../Errors/log-error.js';
import PhotoInfo from '../../models/PhotoInfo.js';

const __filename = fileURLToPath(import.meta.url);
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const postPhoto = async (req, res) => {
  let { category, email } = req.body;
  category = category.toLowerCase().trim();
  email = email.toLowerCase().trim();
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

    const result = await PhotoInfo.insertOne(category, req.user);
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

export default postPhoto;
