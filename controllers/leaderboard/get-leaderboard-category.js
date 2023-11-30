import Joi from 'joi';

import categoryLeaderboardService from '../../services/leaderboard/category-leaderboard.js';

const paramSchema = Joi.string()
    .valid(
        'paper',
        'cardboard',
        'compost',
        'metal',
        'glass',
        'plastic',
        'trash',
        'other',
        'unknown',
    )
    .required();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getLeaderboardByCategory = async (req, res, next) => {
    const { category } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 10;
    let user;
    if (req.user) {
        user = req.user;
    }

    // Validate request body
    try {
        const { error } = paramSchema.validate(category);
        if (error) {
            return res.status(422).send({
                message: 'Validation Error',
                error: error.details[0].message,
            });
        }

        // Execute service
        const result = await categoryLeaderboardService(
            category,
            page,
            perPage,
            user,
        );

        // Return successful request
        return res.status(200).send(result);
    } catch (error) {
        return next(error);
    }
};

export default getLeaderboardByCategory;
