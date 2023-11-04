import { getBlacklistCollection } from '../../DB/collections.js';

const blacklistCollection = getBlacklistCollection;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const postLogout = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];

    await blacklistCollection.insertOne({
      token,
      username: req.user.username,
      createdAt: Date.now(),
    });

    return res.status(201).send({ message: 'Logged out user' });
  } catch (error) {
    return next(error);
  }
};

export default postLogout;
