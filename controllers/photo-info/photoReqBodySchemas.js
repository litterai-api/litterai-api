import Joi from 'joi';

const postPhotoBodySchema = Joi.object({
    category: Joi.string()
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
        .required(),
    email: Joi.string().email().required(),
});

export default postPhotoBodySchema;
