import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { getCatCountCollection } from '../../DB/collections.js';

import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

/**
 * @type {import('mongodb').Collection}
 */
const catCountCollection = getCatCountCollection;

const leaderboardByCategory = async (category, page, perPage, user = null) => {
  try {
    const skip = (page - 1) * perPage;
    const cursor = catCountCollection
      .find(
        { [`pictureData.${category}`]: { $gt: 0 } },
        {
          projection: {
            username: 1,
            displayUsername: 1,
            [`pictureData.${category}`]: 1,
          },
        },
      )
      .sort({ [`pictureData.${category}`]: -1 })
      .skip(skip)
      .limit(perPage);
    const sortedResults = await cursor.toArray();

    const reshapedResults = sortedResults.map((doc) => ({
      username: doc.username,
      itemCount: doc.pictureData[category],
    }));
    const totalEntries = await catCountCollection.countDocuments({
      [`pictureData.${category}`]: { $gt: 0 },
    });

    // Check if user is in the array
    let userRank;
    if (user) {
      // Check if user is in this page of results
      const userInArray = sortedResults.find(
        (doc) => doc.userId === new ObjectId(user._id),
      );
      // If the user is not in the result page get their place in the rankings
      if (!userInArray) {
        const findUsercursor = catCountCollection
          .find({ [`pictureData.${category}`]: { $gt: 0 } })
          .sort({
            [`pictureData.${category}`]: -1,
          });
        const sortedArry = await findUsercursor.toArray();
        userRank = sortedArry.findIndex(
          (doc) => doc.userId.toString() === user._id,
        );
      } else {
        // If they are in the array get their place in the ranking
        userRank = sortedResults.findIndex(
          (doc) => doc.userId.toString() === user._id,
        );
      }
    }
    return {
      code: 200,
      data: {
        category,
        userRank: userRank === -1 ? -1 : userRank + 1,
        totalEntries,
        leaderboard: reshapedResults,
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

export default leaderboardByCategory;
