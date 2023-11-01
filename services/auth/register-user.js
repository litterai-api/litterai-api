import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User/User.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const { JWT_SECRET } = process.env;

const registerUserService = async (body) => {
  const { username, email, password, firstName, lastName, zipCode } = body;

  if (
    (await User.findByEmail(email)) ||
    (await User.findByUsername(username))
  ) {
    const error = new Error('Username or Email already in use');
    logError(error, __filename, 'create');
    error.statusCode = 409;
    throw error;
  }

  const hashedPass = await bcrypt.hash(password.trim(), 10);

  const result = await User.create(
    username,
    email,
    hashedPass,
    firstName,
    lastName,
    zipCode,
  );

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
    logError(error, __filename, 'registerUserService token signing');
    error.statusCode = 500;
    error.message = `Internal Service Error: ${error.message}`;
    throw error;
  }

  return { user: { ...result }, token };
};

export default registerUserService;
