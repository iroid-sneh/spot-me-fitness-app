import Joi from "joi";

export default Joi.object().keys({
    fullName: Joi.string().max(100).optional(),
    bio: Joi.string().max(500).allow("").optional(),
    heightCm: Joi.number().integer().min(100).max(250).optional(),
    distancePrefKm: Joi.number().integer().min(1).max(500).optional(),
}).min(1);
