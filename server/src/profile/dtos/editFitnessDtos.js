import Joi from "joi";
import {
    WORKOUT_TYPES,
    WORKOUT_FREQUENCY,
    FITNESS_GOALS,
    TRAINING_STYLES,
    DIET_STYLES,
    INTENTS,
    STYLE_PREF,
} from "../../common/constants/enums.js";

export default Joi.object().keys({
    workoutTypes: Joi.array().items(Joi.string().valid(...WORKOUT_TYPES)).optional(),
    workoutFrequency: Joi.string().valid(...WORKOUT_FREQUENCY).optional(),
    fitnessGoals: Joi.array().items(Joi.string().valid(...FITNESS_GOALS)).optional(),
    trainingStyles: Joi.array().items(Joi.string().valid(...TRAINING_STYLES)).optional(),
    dietStyle: Joi.string().valid(...DIET_STYLES).optional(),
    intent: Joi.string().valid(...INTENTS).optional(),
    stylePreference: Joi.string().valid(...STYLE_PREF).optional(),
}).min(1);
