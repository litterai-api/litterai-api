/* eslint-disable no-underscore-dangle */

import { MongoClient } from 'mongodb';

let _db;

export const mongoConnect = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const client = await MongoClient.connect(process.env.MONGO_URI);
    _db = client.db('litterai-api');
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDb = async () => {
  if (_db) {
    return _db;
  }
  try {
    await mongoConnect();
    return _db;
  } catch (error) {
    console.log(error);
    throw new Error('Error connecting to the database');
  }
};
