import Joi from "joi";

export default Joi.object({
    minMediaUpload: Joi.number().integer().min(1).max(10).required(),
    maxVideoLength: Joi.number().integer().min(1).max(60).required(),
    faceVerificationRequired: Joi.boolean().required(),
    autoRejectThreshold: Joi.number().integer().min(1).max(10).required(),
    reportAutoFlag: Joi.number().integer().min(1).max(50).required(),
    banAppealWindow: Joi.number().integer().min(1).max(365).required(),
    premiumFeatures: Joi.object({
        rewind: Joi.boolean().required(),
        profileBoost: Joi.boolean().required(),
        unlockPrompt: Joi.boolean().required(),
        superLike: Joi.boolean().required(),
        priorityQueue: Joi.boolean().required(),
    }).required(),
});
