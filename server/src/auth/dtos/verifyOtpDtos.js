import Joi from "joi";
import { OTP_TYPE_VALUES } from "../../common/constants/index.js";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    otp: Joi.string().length(6).required().label("otp"),
    type: Joi.number().integer().valid(...OTP_TYPE_VALUES).optional().label("type"),
});
