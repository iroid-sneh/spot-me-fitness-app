import Joi from "joi";

export default Joi.object({
    note: Joi.string().allow("", null).max(1000).optional(),
    userAction: Joi.string().valid("none", "suspend", "ban").default("none"),
});
