import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { getUserCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';
import createUserPhotoDoc from './helpers.js';

/**
 * @type {import('mongodb').Collection}
 */
const userCollection = getUserCollection;

const { JWT_SECRET } = process.env;
const __filename = fileURLToPath(import.meta.url);

const registerUser = async (body) => {
  let { username, email, firstName, lastName, password } = body;
  const { zipCode } = body;
  const displayUsername = username;
  username = username.toLowerCase().trim();
  email = email.toLowerCase().trim();
  password = password.trim();
  firstName = `${firstName[0].toUpperCase().trim()}${firstName
    .substring(1)
    .trim()}`;
  lastName = `${lastName[0].toUpperCase().trim()}${lastName
    .substring(1)
    .trim()}`;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const payload = {
      username,
      displayUsername,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      zipCode,
    };
    const insertResult = await userCollection.insertOne(payload);

    if (!insertResult.acknowledged) {
      return {
        code: 400,
        data: 'There was an error processing your registration request.',
      };
    }

    await createUserPhotoDoc(
      insertResult.insertedId,
      username,
      displayUsername,
      email,
    );

    const token = jwt.sign(
      {
        _id: insertResult.insertedId.toHexString(),
        username,
        email,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return {
      code: 201,
      data: {
        _id: insertResult.insertedId.toHexString(),
        username: displayUsername,
        email,
        firstName,
        lastName,
        zipCode,
        token,
      },
    };
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default registerUser;
