import {
    categoryLeaderboardParamSchema,
    getLeaderboardTotalSchema,
} from './leaderboardReqSchemas.js';
import CategoryCount from '../../models/CategoryCount.js';
import leaderboardModel from '../../models/leaderboard/index.js';

const leaderboardController = {
    getLeaderboardByCategory: async (req, res, next) => {
        const { category } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.perPage, 10) || 10;
        let user;
        if (req.user) {
            user = req.user;
        }

        // Validate request body
        try {
            const { error } = categoryLeaderboardParamSchema.validate(category);
            if (error) {
                return res.status(422).send({
                    message: 'Validation Error',
                    error: error.details[0].message,
                });
            }
            console.log(category, user);
            // Execute service
            const result = await CategoryCount.getLeaderboardByCategory({
                category,
                page,
                perPage,
                userId: user?._id,
            });

            // Return successful request
            return res.status(200).send(result);
        } catch (error) {
            return next(error);
        }
    },

    getLeaderboardByTotal: async (req, res, next) => {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.perPage, 10) || 10;
        let user;
        if (req.user) {
            user = req.user;
        }

        try {
            const { error } = getLeaderboardTotalSchema.validate({
                page,
                perPage,
            });
            if (error) {
                return res.status(422).send({
                    message: 'Validation Error',
                    error: error.details[0].message,
                });
            }

            const { code, data } = await leaderboardModel.leaderboardByTotal(
                page,
                perPage,
                user,
            );

            return res.status(code).send(data);
        } catch (error) {
            return next(error);
        }
    },
};

export default leaderboardController;
