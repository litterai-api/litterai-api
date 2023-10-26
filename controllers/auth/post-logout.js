import { fileURLToPath } from 'url';

import logError from '../../Errors/log-error.js';
import { getBlacklistCollection } from '../../DB/collections.js';

const blacklistCollection = getBlacklistCollection;

const __filename = fileURLToPath(import.meta.url);
const postLogout = async (req, res) => {
  try {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    console.log(blacklistCollection);
    const result = await blacklistCollection.insertOne({
      token,
      username: req.user.username,
      createdAt: Date.now(),
    });

    return res.status(201).send({ message: 'Logged out' });
  } catch (error) {
    console.error(error);
    logError(error, __filename, 'postLogout');
    return res.status(500).send({ message: 'Internal Service Error' });
  }
};

export default postLogout;
