import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { getCatCountCollection } from '../DB/collections.js';
import errorHelpers from './helpers/errorHelpers.js';

const __filename = fileURLToPath(import.meta.url);
/**
 * @type {import('mongodb').Collection}
 */
let catCountCollection =
    process.env.NODE_ENV !== 'test' && getCatCountCollection;

const CategoryCount = {
    injectDB: (db) => {
        if (process.env.NODE_ENV === 'test') {
            catCountCollection = db.collection('categoryCounts');
        }
    },

    create: async (userId, username, displayUsername, email) => {
        if (typeof userId === 'string') {
            // eslint-disable-next-line no-param-reassign
            userId = new ObjectId(userId);
        }
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
            const result = await catCountCollection.insertOne(payload);

            return result;
        } catch (error) {
            throw await errorHelpers.transformDatabaseError(
                error,
                __filename,
                'CategoryCount.create',
            );
        }
    },

    getLeaderboardByCategory: async ({
        category,
        page,
        perPage,
        userId = null,
    }) => {
        let includeLoggedInUserPipeline = false;
        if (userId) {
            includeLoggedInUserPipeline = true;
        }

        let userObjectId;
        if (typeof userId === 'string') {
            userObjectId = new ObjectId(userId);
        }

        const startIndex = (page - 1) * perPage;

        const pipeline = [
            {
                $facet: {
                    // Branch for full leaderboard
                    leaderboard: [
                        {
                            $match: {
                                [`pictureData.${category}`]: { $gt: 0 },
                            },
                        },
                        {
                            $group: {
                                _id: '$userId',
                                itemCount: { $sum: `$pictureData.${category}` },
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'userInfo',
                            },
                        },
                        { $unwind: '$userInfo' },
                        {
                            $project: {
                                userId: '$_id',
                                _id: 0,
                                username: '$userInfo.username',
                                displayUsername: '$userInfo.displayUsername',
                                itemCount: 1,
                            },
                        },
                        { $sort: { itemCount: -1 } },
                        {
                            $group: {
                                _id: null,
                                data: { $push: '$$ROOT' },
                            },
                        },
                        {
                            $unwind: {
                                path: '$data',
                                includeArrayIndex: 'data.rank',
                            },
                        },
                        { $replaceRoot: { newRoot: '$data' } },
                        {
                            $project: {
                                username: '$displayUsername',
                                itemCount: 1,
                                rank: { $add: ['$rank', 1] },
                            },
                        },
                    ],
                    // Conditional inclusion of loggedInUser
                    // prettier-ignore
                    ...(includeLoggedInUserPipeline ? {
                        loggedInUser: [
                            { $sort: { itemCount: -1 } },
                            {
                                $group: {
                                    _id: null,
                                    data: { $push: '$$ROOT' },
                                },
                            },
                            {
                                $unwind: {
                                    path: '$data',
                                    includeArrayIndex: 'data.rank',
                                },
                            },
                            { $replaceRoot: { newRoot: '$data' } },
                            { $match: { userId: userObjectId } },
                            {
                                $project: {
                                    username: '$displayUsername',
                                    totalUploads: 1,
                                    rank: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    `$pictureData.${category}`,
                                                    0,
                                                ],
                                            },
                                            then: -1,
                                            else: '$rank',
                                        },
                                    },
                                },
                            },
                        ],
                    }
                        : {}),
                },
            },
            {
                $project: {
                    leaderboard: '$leaderboard',
                    loggedInUser: { $arrayElemAt: ['$loggedInUser', 0] },
                },
            },
        ];

        try {
            const [result] = await catCountCollection
                .aggregate(pipeline)
                .toArray();

            let responseObject = {
                category,
            };
            if (result.loggedInUser) {
                responseObject = {
                    ...responseObject,
                    userRank: result.loggedInUser.rank,
                    totalEntries: result.leaderboard.length,
                    leaderboard: result.leaderboard.slice(
                        startIndex,
                        perPage + startIndex,
                    ),
                };
            } else {
                responseObject = {
                    ...responseObject,
                    userRank: null,
                    totalEntries: result.leaderboard.length,
                    leaderboard: result.leaderboard.slice(
                        startIndex,
                        perPage + startIndex,
                    ),
                };
            }
            return responseObject;
        } catch (error) {
            throw await errorHelpers.transformDatabaseError(
                error,
                __filename,
                'CategoryCount.getLeaderboardByCategory',
            );
        }
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

    deleteUserInfo: async (userId) => {
        let userObjectId;
        if (typeof userId === 'string') {
            userObjectId = new ObjectId(userId);
        }
        try {
            const result = await catCountCollection.deleteOne({
                userId: userObjectId || userId,
            });
            return result.acknowledged;
        } catch (error) {
            error.statusCode = 500;
            throw error;
        }
    },
};

export default CategoryCount;
