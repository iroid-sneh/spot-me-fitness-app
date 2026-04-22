import Joi from "joi";

export default Joi.object().keys({
    imageUrl: Joi.string().uri().required().label("imageUrl"),
});
