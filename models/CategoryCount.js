import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { getCatCountCollection } from '../DB/collections.js';
import errorHelpers from './helpers/errorHelpers.js';

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
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'CategoryCount.create',
      );
    }
  },

  getLeaderboardByCategory: async (category, page, perPage) => {
    // Create an aggregation pipeline prefix
    const aggregatePipelinePrefix = [
      {
        $match: {
          [`pictureData.${category}`]: {
            $gt: 0,
          },
        },
      },
      {
        $sort: {
          [`pictureData.${category}`]: -1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          displayUsername: '$user.displayUsername',
          itemCount: `$pictureData.${category}`,
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
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'CategoryCount.getLeaderboardByCategory',
      );
    }

    return { leaderboard: result, totalEntries };
  },

  findByUserId: async (_id) => {
    let userId = _id;
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    try {
      const categoryCountDocument = await catCountCollection.findOne(
        { userId },
        {
          projection: {
            userId: 1,
            displayUsername: 1,
            username: 1,
            pictureData: 1,
            totalUploads: 1,
          },
        },
      );
      return categoryCountDocument;
    } catch (error) {
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'CategoryCount.findByUserId',
      );
    }
  },

  incrementCategoryByUserId: async (
    categoryString,
    userId,
    incrementAmount,
  ) => {
    if (typeof userId === 'string') {
      // eslint-disable-next-line no-param-reassign
      userId = new ObjectId(userId);
    }
    try {
      const categoryDocument = await catCountCollection.findOneAndUpdate(
        { userId },
        {
          $inc: {
            totalUploads: incrementAmount,
            [`pictureData.${categoryString}`]: incrementAmount,
          },
        },
        { returnDocument: 'after' },
      );
      return categoryDocument;
    } catch (error) {
      throw await errorHelpers.transformDatabaseError(
        error,
        __filename,
        'CategoryCount.incrementCategoryByUserId',
      );
    }
  },
};

export default CategoryCount;
