import Joi from "joi";

export default Joi.object().keys({
    isFitness: Joi.boolean().required(),
});
