/* eslint-disable no-param-reassign */
import { ObjectId } from 'mongodb';

// import { getBlacklistCollection } from '../DB/collections.js';
import { getDb } from '../DB/db-connection.js';
import userModel from './User.js';

const santizeId = (id) => {
    if (typeof id === 'string') {
        return new ObjectId(id);
    }
    return id;
};

const rtCollectName = 'refreshToken';
const refreshTokenModel = {
    addToken: async ({ token, userId, expiresAt, createdAt }) => {
        const userObjId = santizeId(userId);

        try {
            /**
             * @type {import('mongodb').Db}
             */
            const db = await getDb();
            await db.collection(rtCollectName).insertOne({
                token,
                userId: userObjId,
                expiresAt,
                createdAt,
                revoked: false,
            });
        } catch (error) {
            error.statusCode = 500;
            error.message = `There was an error inserting the Refresh Token: ${error.message}`;
            throw error;
        }
    },

    updateRevokedToTrue: async ({ userId }) => {
        const userObjId = santizeId(userId);
        try {
            /**
             * @type {import('mongodb').Db}
             */
            const db = await getDb();
            await db
                .collection(rtCollectName)
                .findOneAndUpdate(
                    { userId: userObjId },
                    { $set: { revoked: true } },
                );
        } catch (error) {
            error.statusCode = 500;
            error.message = `There was an revoking the Refresh Token: ${error.message}`;
            throw error;
        }
    },

    validateToken: async ({ token }) => {
        try {
            /**
             * @type {import('mongodb').Db}
             */
            const db = await getDb();
            const tokenDocument = await db
                .collection(rtCollectName)
                .findOne({ token });
            if (!tokenDocument || token.revoked) {
                return { valid: false, userData: [] };
            }
            const userDoc = await userModel.findById(tokenDocument.userId);

            if (!userDoc) {
                throw new Error();
            }

            return {
                valid: true,
                userData: {
                    _id: userDoc._id,
                    email: userDoc.email,
                    username: userDoc.username,
                    zipCode: userDoc.zipCode,
                },
            };
        } catch (error) {
            error.statusCode = 500;
            error.message = `There was an error getting Refresh Token: ${error.message}`;
            throw error;
        }
    },
};
export default refreshTokenModel;
