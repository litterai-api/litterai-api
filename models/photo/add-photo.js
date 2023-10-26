import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';

import {
  getCatCountCollection,
  getUploadInfoCollection,
} from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';
/**
 * @type {import('mongodb').Collection}
 */
const categoryCollection = getCatCountCollection;
const uploadCollection = getUploadInfoCollection;

const __filename = fileURLToPath(import.meta.url);

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} email
 * @property {string} _id
 */

/**
 * @param {string} category
 * @param {User} user
 */
const addPhoto = async (categoryString, user) => {
  try {
    await uploadCollection.insertOne({
      userId: new ObjectId(user._id),
      category: categoryString,
      createdAt: Date.now(),
    });

    await categoryCollection.updateOne(
      { userId: new ObjectId(user._id) },
      { $inc: { totalUploads: 1, [`pictureData.${categoryString}`]: 1 } },
    );
    return { code: 201, data: { message: 'Succesfully added photo' } };
  } catch (error) {
    console.log(error);
    logError(error, __filename, 'addPhoto');
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default addPhoto;