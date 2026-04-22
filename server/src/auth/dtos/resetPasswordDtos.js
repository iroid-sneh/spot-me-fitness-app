import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().min(8).max(128).required().label("password"),
    confirmPassword: Joi.string().min(8).max(128).required().label("confirmPassword"),
});
