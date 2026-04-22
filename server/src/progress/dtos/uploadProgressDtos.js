import Joi from "joi";
import { WORKOUT_TYPES } from "../../common/constants/enums.js";

export default Joi.object().keys({
    source: Joi.string().valid("app_internal_camera").required().label("source"),
    workoutType: Joi.string().valid(...WORKOUT_TYPES).optional(),
    caption: Joi.string().max(300).allow("").optional(),
});
