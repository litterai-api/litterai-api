import { fileURLToPath } from 'url';
import Joi from 'joi';

import CategoryCount from '../../models/CategoryCount.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const paramSchema = Joi.object({
  userId: Joi.string().length(24).required(),
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getUserPhotoCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const { error } = paramSchema.validate({ userId });
    if (error) {
      return res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }

    const userCategoryCountDoc = await CategoryCount.findByUserId(userId);

    if (!userCategoryCountDoc) {
      return res.status(404).send({ message: 'User not found.' });
    }

    return res.status(200).send(userCategoryCountDoc);
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default getUserPhotoCount;
