import logoutUserService from '../../services/auth/logout-user.js';
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const postLogout = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];

        await logoutUserService(token);
        return res.status(200).send({ message: 'Logged out user' });
    } catch (error) {
        return next(error);
    }
};

export default postLogout;
