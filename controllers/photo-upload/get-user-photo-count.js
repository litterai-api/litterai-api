import { fileURLToPath } from 'url';
import Joi from 'joi';

import { getCatCountCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';

const catCountCollection = getCatCountCollection;

const __filename = fileURLToPath(import.meta.url);

const paramSchema = Joi.string().required();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getUserPhotoCount = async (req, res) => {
  let { username } = req.params;
  username = username.toLowerCase();

  try {
    const { error } = paramSchema.validate(username);
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    console.log('USERNAME: ', username);
    const userPhotoDoc = await catCountCollection.findOne(
      { username },
      {
        projection: {
          userId: 1,
          displayUsername: 1,
          username: 1,
          pictureData: 1,
          totalUploads: 1,
        },
      },
    );

    if (!userPhotoDoc) {
      return res.status(404).send({ message: 'User not found.' });
    }

    return res.status(200).send(userPhotoDoc);
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default getUserPhotoCount;
