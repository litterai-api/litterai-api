import { fileURLToPath } from 'url';

import { getBlacklistCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';
/**
 * @type {import('mongodb').Collection}
 */
const blacklistCollection = getBlacklistCollection;

const __filename = fileURLToPath(import.meta.url);

const logoutUser = async () => {
  try {



  } catch (error) {
    logError(error, __filename, 'loginUser');
    console.log(error);
    return { code: 500, data: { message: 'Internal Service Error' } };
  }
};
export default logoutUser;
