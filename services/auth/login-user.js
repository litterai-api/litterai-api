import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User/User.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const { JWT_SECRET } = process.env;

const loginUserService = async (body) => {
  let { email, password } = body;
  email = email.toLowerCase().trim();
  password = password.toLowerCase();

  const result = await User.findByEmail(email);
  if (!result) {
    return null;
  }

  const validPass = await bcrypt.compare(password, result.password);
  if (!validPass) {
    return null;
  }

  let token;

  try {
    token = jwt.sign(
      {
        _id: result._id,
        username: result.username,
        email: result.email,
      },
      JWT_SECRET,
    );
  } catch (error) {
    console.log(error);
    logError(error, __filename, 'loginUserService');
    error.statusCode = 500;
    error.message = `Internal Service Error: ${error.message}`;
    throw error;
  }

  return {
    user: {
      _id: result._id,
      username: result.username,
      displayUsername: result.displayUsername,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      zipCode: result.zipCode,
    },
    token,
  };
};

export default loginUserService;
