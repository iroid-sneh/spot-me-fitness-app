import Joi from "joi";
import { SMOKING, DRINKING, KIDS } from "../../common/constants/enums.js";

export default Joi.object().keys({
    smoking: Joi.string().valid(...SMOKING).optional(),
    drinking: Joi.string().valid(...DRINKING).optional(),
    kids: Joi.string().valid(...KIDS).optional(),
    language: Joi.string().max(200).optional(),
    lookingFor: Joi.string().max(500).optional(),
}).min(1);
