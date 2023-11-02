import { ObjectId } from 'mongodb';

import { getUserCollection } from '../../DB/collections.js';
import CategoryCount from '../CategoryCount/CategoryCount.js';

/**
 * @type {import('mongodb').Collection}
 */

const usersCollection = getUserCollection;

const User = {
  findByEmail: async (email) => {
    const sanitizedEmail = email.toLowerCase().trim();
    try {
      const userDoc = await usersCollection.findOne({ email: sanitizedEmail });
      return userDoc;
    } catch (error) {
      error.statusCode = 500;
      error.message = `Internal Service Error: ${error.message}`;
      throw error;
    }
  },

  findById: async (_id) => {
    let userId = _id;
    try {
      if (typeof _id === 'string') {
        userId = new ObjectId(_id);
      }
      const userDoc = await usersCollection.findOne({ _id: userId });
      return userDoc;
    } catch (error) {
      error.statusCode = 500;
      error.message = `Internal Service Error: ${error.message}`;
      throw error;
    }
  },

  findByUsername: async (username) => {
    try {
      const userDoc = await usersCollection.findOne({
        username: username.toLowerCase(),
      });
      return userDoc;
    } catch (error) {
      error.statusCode = 500;
      error.message = `Internal Service Error: ${error.message}`;
      throw error;
    }
  },

  create: async (
    displayUsername,
    email,
    hashedPassword,
    firstName,
    lastName,
    zipCode,
  ) => {
    if (
      !displayUsername ||
      !email ||
      !hashedPassword ||
      !firstName ||
      !lastName ||
      !zipCode
    ) {
      const error = new Error('Missing input parameter');
      error.statusCode = 400;
      throw error;
    }
    // Sanitize data
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const lowerCaseUsername = displayUsername.toLowerCase().trim();
    const trimmedDisplayname = displayUsername.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedZipCode = zipCode.trim();
    // Create payload
    const payload = {
      username: lowerCaseUsername,
      displayUsername: trimmedDisplayname,
      email: trimmedEmail,
      password: hashedPassword,
      firstName: `${trimmedFirstName[0].toUpperCase()}${trimmedFirstName.substring(
        1,
      )}`,
      lastName: `${trimmedLastName[0].toUpperCase()}${trimmedLastName.substring(
        1,
      )}`,
      zipCode: trimmedZipCode,
    };

    try {
      const userDoc = await usersCollection.insertOne(payload);
      // Create a category count document within CategoryCount Collection
      await CategoryCount.create(
        userDoc.insertedId,
        lowerCaseUsername,
        trimmedDisplayname,
        trimmedEmail,
      );

      return {
        _id: userDoc.insertedId.toHexString(),
        username: payload.username,
        displayUsername: payload.displayUsername,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        zipCode: payload.zipCode,
      };
    } catch (error) {
      error.message = `Database operation failed: ${error.message}`;
      error.statusCode = 500;
      throw error;
    }
  },
};

export default User;
