import { fileURLToPath } from 'url';
import { getCatCountCollection } from '../../DB/collections.js';
import logError from '../../Errors/log-error.js';

const __filename = fileURLToPath(import.meta.url);

/**
 * @type {import('mongodb').Collection}
 */
const catCountCollection = getCatCountCollection;

const CategoryCount = {
  create: async (userId, username, displayUsername, email) => {
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
  },

  getLeaderboardByCategory: async (category, page, perPage) => {
    // Create an aggregation pipeline prefix
    const aggregatePipelinePrefix = [
      {
        $match: {
          [`pictureData.${category}`]: { $gt: 0 },
        },
      },
      {
        $project: {
          username: 1,
          displayUsername: 1,
          itemCount: `$pictureData.${category}`,
        },
      },
      {
        $sort: {
          itemCount: -1,
        },
      },
    ];
    // Declare leaderboard result and total entries
    let result;
    let totalEntries;

    try {
      // If called without page and perPage argument
      // assume they want the whole leaderboard and do not need total entries.
      if (!page && !perPage) {
        // query db
        result = await catCountCollection
          .aggregate(aggregatePipelinePrefix)
          .toArray();
        return { leaderboard: result };
      }
      // If page and perPage were entered return a section of the leaderboard and total entries
      const startIndex = (page - 1) * perPage;
      // append steps to the aggregation pipeline
      const aggregationPipeline = [
        ...aggregatePipelinePrefix,
        { $skip: startIndex },
        { $limit: perPage },
      ];

      // query db
      result = await catCountCollection
        .aggregate(aggregationPipeline)
        .toArray();

      totalEntries = await catCountCollection.countDocuments({
        [`pictureData.${category}`]: { $gt: 0 },
      });
    } catch (error) {
      error.message = `Internal Service Error: ${error.message}`;
      error.statusCode = 500;
      throw error;
    }

    return { leaderboard: result, totalEntries };
  },
};

export default CategoryCount;