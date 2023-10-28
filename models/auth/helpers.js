import { fileURLToPath } from 'url';
import { getCatCountCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

const catCountCollection = getCatCountCollection;

const createUserPhotoDoc = async (userId, username, displayUsername, email) => {
  try {
    const payload = {
      userId,
      email,
      username,
      displayUsername,
      pictureData: {
        paper: 0,
        cardboard: 0,
        compost: 0,
        metal: 0,
        glass: 0,
        plastic: 0,
        trash: 0,
        other: 0,
        unknown: 0,
      },
      totalUploads: 0,
    };

    catCountCollection.insertOne(payload);
  } catch (error) {
    await logError(error, __filename, 'createUserPhotoDoc');
    console.log(error);
  }
};

export default createUserPhotoDoc;
