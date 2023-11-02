import { ObjectId } from 'mongodb';
import { getUploadInfoCollection } from '../DB/collections.js';
import CategoryCount from './CategoryCount.js';

/**
 * @type {import('mongodb').Collection}
 */
const photoInfoCollection = getUploadInfoCollection;
/**
 * @type {import('mongodb').Collection}
 */

const PhotoInfo = {
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
  insertOne: async (categoryString, user) => {
    try {
      // Insert new photoInfo document
      await photoInfoCollection.insertOne({
        userId: new ObjectId(user._id),
        username: user.username,
        category: categoryString,
        createdAt: Date.now(),
      });
    } catch (error) {
      error.message = `Database operation failed: ${error.message}`;
      error.statusCode = 500;
      throw error;
    }
    // Update user's category count collection
    const categoryDocument = await CategoryCount.incrementCategoryByUserId(
      categoryString,
      user._id,
      1,
    );
    // Respond with 404 error if user's category document not found
    if (!categoryDocument) {
      const error = new Error(
        "Unable to locate user's category count document",
      );
      error.statusCode = 404;
      throw error;
    }

    return {
      username: categoryDocument.username,
      category: categoryString,
      categoryUploads: categoryDocument.pictureData[categoryString],
      totalUploads: categoryDocument.totalUploads,
    };
  },
};

export default PhotoInfo;
