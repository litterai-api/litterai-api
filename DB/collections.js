/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */

import { getDb } from './db-connection.js';

let userCollection;
let uploadCollection;
let categoryCountCollection;
let blacklistCollection;

const getCollection = async (collectionName, collection) => {
  if (collection) {
    return collection;
  }
  try {
    const db = await getDb();
    collection = await db.collection(collectionName);
    return collection;
  } catch (error) {
    console.log(error);
  }
};

export const getUserCollection = await getCollection('users', userCollection);
export const getUploadInfoCollection = await getCollection(
  'uploads',
  uploadCollection,
);
export const getCatCountCollection = await getCollection(
  'categoryCounts',
  categoryCountCollection,
);
export const getBlacklistCollection = await getCollection(
  'blacklistTokens',
  blacklistCollection,
);
