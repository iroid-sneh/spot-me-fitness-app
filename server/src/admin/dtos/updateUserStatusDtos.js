import Joi from "joi";

export default Joi.object({
    status: Joi.string().valid("active", "flagged", "inactive", "banned", "suspended").required(),
    reason: Joi.string().allow("", null).max(500).optional(),
});
