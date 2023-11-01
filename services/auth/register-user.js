import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User/User.js';

const { JWT_SECRET } = process.env;

const registerUserService = async (body) => {
  const { username, email, password, firstName, lastName, zipCode } = body;

  if (
    (await User.findByEmail(email)) ||
    (await User.findByUsername(username))
  ) {
    const error = new Error('Username or Email already in use');
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

  const token = jwt.sign(
    {
      _id: result._id,
      username: result.username,
      email: result.email,
    },
    JWT_SECRET,
  );

  return {
    ...result,
    token,
  };
};

export default registerUserService;
