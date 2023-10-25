import { fileURLToPath } from 'url';
import { getUserCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const users = getUserCollection;

const registerUser = async () => {
  try {
    const userDoc = users.findOne();
    if (userDoc) {
      // send back correct code and a message
      return { code: 'someNumber', data: { message: 'Some Text' } };
    }
    return { code: 'someNumber', data: { message: 'Some Text' } };
  } catch (error) {
    logError(error, __filename, 'register');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};

export default registerUser;
