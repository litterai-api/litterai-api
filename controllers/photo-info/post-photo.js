import postPhotoBodySchema from './photoReqBodySchemas.js';
import PhotoInfo from '../../models/PhotoInfo.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const postPhoto = async (req, res, next) => {
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
      return res.status(401).send({ message: 'Invalid email.' });
    }

    const result = await PhotoInfo.insertOne(category, req.user);

    return res.status(201).send(result);
  } catch (error) {
    return next(error);
  }
};

export default postPhoto;
