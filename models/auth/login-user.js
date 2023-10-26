import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { getUserCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';
/**
 * @type {import('mongodb').Collection}
 */
const usersCollection = getUserCollection;

const __filename = fileURLToPath(import.meta.url);
const { JWT_SECRET } = process.env;

const loginUser = async (body) => {
  let { email, password } = body;
  email = email.toLowerCase().trim();
  password = password.trim();
  try {
    const userDoc = await usersCollection.findOne({ email });
    console.log('userDoc: ', userDoc);
    if (!userDoc) {
      // send back correct code and a message
      return { code: 401, data: { message: 'Incorrect email or password' } };
    }

    const validPass = await bcrypt.compare(password, userDoc.password);
    if (!validPass) {
      return { code: 401, data: { message: 'Incorrect email/password' } };
    }

    // When signing token include _id as a string, username, and email
    const token = jwt.sign(
      {
        _id: userDoc._id.toHexString(),
        username: userDoc.username,
        email: userDoc.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    return {
      code: 201,
      data: {
        username: userDoc.username,
        email: userDoc.email,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        zipCode: userDoc.zipCode,
        token,
      },
    };
  } catch (error) {
    logError(error, __filename, 'loginUser');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};
export default loginUser;
