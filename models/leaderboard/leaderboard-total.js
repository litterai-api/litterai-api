import { fileURLToPath } from 'url';
import { getCatCountCollection } from '../../DB/collections.js';

import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

/**
 * @type {import('mongodb').Collection}
 */

const catCountCollection = getCatCountCollection;

const leaderboardByTotal = async (page, perPage, user = null) => {
  try {
    const skip = (page - 1) * perPage;
    const cursor = catCountCollection
      .find(
        { totalUploads: { $gt: 0 } },
        {
          projection: {
            _id: 0,
            username: 1,
            displayUsername: 1,
            totalUploads: 1,
          },
        },
      )
      .sort({ totalUploads: -1 })
      .skip(skip)
      .limit(perPage);

    const sortedResults = await cursor.toArray();

    const totalEntries = await catCountCollection.countDocuments({
      totalUploads: { $gt: 0 },
    });


    let userRank;
    if (user) {
      const userInArray = sortedResults.find(
        (doc) => doc.username === user.username,
      );

      if (!userInArray) {
        const findUserCursor = catCountCollection
          .find({ totalUploads: { $gt: 0 } })
          .sort({ totalUploads: -1 });
        const sortedArray = await findUserCursor.toArray();
        
        userRank =
          sortedArray.findIndex((doc) => doc.userId.toString() === user._id) +
          1;
      } else {
        userRank =
          sortedResults.findIndex((doc) => doc.userId.toString() === user._id) +
          1;
      }
    }

    if (userRank === null) userRank = null;
    else if (userRank === 0) userRank = -1;

    return {
      code: 200,
      data: {
        userRank,
        totalEntries,
        leaderboard: sortedResults,
      },
    };
  } catch (error) {
    console.log(error);
    logError(error, __filename, 'leaderboardByCategory');
    return {
      code: 500,
      data: { message: 'Internal Service Error' },
    };
  }
};

export default leaderboardByTotal;
