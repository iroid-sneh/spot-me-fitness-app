import Joi from "joi";
import { OTP_TYPE_VALUES } from "../../common/constants/index.js";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    type: Joi.number().integer().valid(...OTP_TYPE_VALUES).required().label("type"),
});
