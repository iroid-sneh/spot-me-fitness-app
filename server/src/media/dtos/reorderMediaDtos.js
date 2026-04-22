import Joi from "joi";

export default Joi.object().keys({
    items: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().integer().required(),
                orderIndex: Joi.number().integer().min(1).max(6).required(),
            })
        )
        .min(1)
        .max(6)
        .required(),
});
