import Joi from "joi";
import {
    WORKOUT_TYPES,
    WORKOUT_FREQUENCY,
    FITNESS_GOALS,
    TRAINING_STYLES,
    DIET_STYLES,
    INTENTS,
    GENDERS,
    STYLE_PREF,
    SMOKING,
    DRINKING,
    KIDS,
} from "../../common/constants/enums.js";

const mediaItem = Joi.object({
    url: Joi.string().required(),
    type: Joi.string().valid("photo", "video").required(),
    isFitness: Joi.boolean().default(false),
    isMainPhoto: Joi.boolean().default(false),
    durationSec: Joi.number().min(0).max(7).when("type", { is: "video", then: Joi.required() }),
    source: Joi.string().valid("app_internal_camera", "camera_roll").default("camera_roll"),
    orderIndex: Joi.number().integer().min(1).max(6).optional(),
    mimeType: Joi.string().optional(),
    sizeBytes: Joi.number().integer().optional(),
});

export default Joi.object().keys({
    fullName: Joi.string().max(100).required().label("fullName"),
    bio: Joi.string().max(500).allow("").optional(),
    gender: Joi.string().valid(...GENDERS).required(),
    birthdate: Joi.date().iso().required(),
    heightCm: Joi.number().integer().min(100).max(250).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    distancePrefKm: Joi.number().integer().min(1).max(500).optional(),
    fitness: Joi.object({
        workoutTypes: Joi.array().items(Joi.string().valid(...WORKOUT_TYPES)).min(1).required(),
        workoutFrequency: Joi.string().valid(...WORKOUT_FREQUENCY).required(),
        fitnessGoals: Joi.array().items(Joi.string().valid(...FITNESS_GOALS)).min(1).required(),
        trainingStyles: Joi.array().items(Joi.string().valid(...TRAINING_STYLES)).min(1).required(),
        dietStyle: Joi.string().valid(...DIET_STYLES).optional(),
        intent: Joi.string().valid(...INTENTS).required(),
        stylePreference: Joi.string().valid(...STYLE_PREF).default("no_preference"),
    }).required(),
    lifestyle: Joi.object({
        smoking: Joi.string().valid(...SMOKING).optional(),
        drinking: Joi.string().valid(...DRINKING).optional(),
        kids: Joi.string().valid(...KIDS).optional(),
        language: Joi.string().max(200).optional(),
        lookingFor: Joi.string().max(500).optional(),
    }).optional(),
    media: Joi.array().items(mediaItem).min(4).max(6).required(),
});
