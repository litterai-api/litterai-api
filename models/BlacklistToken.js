import { fileURLToPath } from 'url';

import { getBlacklistCollection } from '../DB/collections.js';
import errorHelpers from './helpers/errorHelpers.js';

const __filename = fileURLToPath(import.meta.url);
/**
 * @type {import('mongodb').Collection}
 */

const blacklistCollection = getBlacklistCollection;

const BlacklistToken = {
  addTokenToList: async (token) => {
    try {
      await blacklistCollection.insertOne({ token });
    } catch (error) {
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'addTokenToList',
      );
    }
  },

  getAllTokens: async () => {
    try {
      const cursor = blacklistCollection.find(
        {},
        { projection: { $token: 1 } },
      );
      const result = await cursor.toArray();
      return result;
    } catch (error) {
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'getAllTokens',
      );
    }
  },
};
export default BlacklistToken;
