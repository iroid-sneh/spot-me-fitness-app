import {
    sequelize,
    Profile,
    FitnessDetails,
    Lifestyle,
    UserMedia,
    User,
    VerificationBadge,
} from "../../models/index.js";
import { Op } from "sequelize";
import commonService from "../common/utils/common.service.js";
import { detectFace } from "../common/utils/faceVerify.js";
import { haversineKm } from "../common/helper.js";
import { PROFILE_MEDIA_MIN, PROFILE_MEDIA_MAX } from "../common/constants/index.js";
import {
    BadRequestException,
    NotFoundException,
    UnprocessableEntityException,
} from "../common/utils/errorException.js";
import getProfileResources from "./resources/getProfileResources.js";

const mapFitnessPayload = (fitness) => ({
    workout_types: fitness.workoutTypes,
    workout_frequency: fitness.workoutFrequency,
    fitness_goals: fitness.fitnessGoals,
    training_styles: fitness.trainingStyles,
    diet_style: fitness.dietStyle,
    intent: fitness.intent,
    style_preference: fitness.stylePreference,
});

const mapLifestylePayload = (lifestyle) => ({
    smoking: lifestyle.smoking,
    drinking: lifestyle.drinking,
    kids: lifestyle.kids,
    language: lifestyle.language,
    looking_for: lifestyle.lookingFor,
});

class profileService {
    static async recomputeActivation(userId, { transaction } = {}) {
        const profile = await Profile.findOne({ where: { user_id: userId }, transaction });
        if (!profile) return null;

        const fitness = await FitnessDetails.findOne({ where: { user_id: userId }, transaction });
        const media = await UserMedia.findAll({ where: { user_id: userId }, transaction });

        const hasEnoughMedia = media.length >= PROFILE_MEDIA_MIN && media.length <= PROFILE_MEDIA_MAX;
        const hasFitnessMedia = media.some((m) => m.is_fitness);
        const hasMainPhoto = media.some((m) => m.is_main_photo);
        const fitnessOk = !!(
            fitness &&
            Array.isArray(fitness.workout_types) && fitness.workout_types.length &&
            fitness.workout_frequency &&
            Array.isArray(fitness.fitness_goals) && fitness.fitness_goals.length &&
            Array.isArray(fitness.training_styles) && fitness.training_styles.length &&
            fitness.intent
        );
        const profileOk = !!(profile.full_name && profile.gender && profile.birthdate);

        const shouldActivate = hasEnoughMedia && hasFitnessMedia && hasMainPhoto && fitnessOk && profileOk;

        if (shouldActivate && profile.profile_status !== "active") {
            await profile.update({ profile_status: "active", activated_at: new Date() }, { transaction });
        } else if (!shouldActivate && profile.profile_status === "active") {
            await profile.update({ profile_status: "pending" }, { transaction });
        }

        return {
            status: shouldActivate ? "active" : "pending",
            checks: { hasEnoughMedia, hasFitnessMedia, hasMainPhoto, fitnessOk, profileOk, mediaCount: media.length },
        };
    }

    static async setupComplete(data, req, res) {
        try {
            const userId = req.user.userId;
            const { fitness, lifestyle, mediaIds, mainPhotoMediaId, fullName, heightCm, distancePrefKm, ...rest } = data;

            if (!mediaIds || mediaIds.length < PROFILE_MEDIA_MIN) {
                throw new UnprocessableEntityException(`At least ${PROFILE_MEDIA_MIN} media items are required`, "MEDIA_COUNT_LOW");
            }
            if (mediaIds.length > PROFILE_MEDIA_MAX) {
                throw new UnprocessableEntityException(`Maximum ${PROFILE_MEDIA_MAX} media items allowed`, "MEDIA_COUNT_HIGH");
            }
            const uniqueMediaIds = [...new Set(mediaIds)];
            if (uniqueMediaIds.length !== mediaIds.length) {
                throw new UnprocessableEntityException("mediaIds must be unique", "MEDIA_IDS_DUPLICATE");
            }

            const existingMedia = await UserMedia.findAll({
                where: {
                    user_id: userId,
                    id: { [Op.in]: uniqueMediaIds },
                },
                order: [["order_index", "ASC"]],
            });
            if (existingMedia.length !== uniqueMediaIds.length) {
                throw new UnprocessableEntityException("One or more media items do not belong to you", "MEDIA_OWNERSHIP");
            }
            if (!existingMedia.some((m) => m.is_fitness)) {
                throw new UnprocessableEntityException("At least one fitness photo or workout clip is required", "FITNESS_MEDIA_REQUIRED");
            }

            const mainPhoto = existingMedia.find((m) => m.id === mainPhotoMediaId);
            if (!mainPhoto) {
                throw new UnprocessableEntityException("mainPhotoMediaId must belong to the selected media", "MAIN_PHOTO_REQUIRED");
            }
            if (mainPhoto.type !== "photo") {
                throw new UnprocessableEntityException("Main profile photo must be a photo, not a video", "MAIN_PHOTO_INVALID_TYPE");
            }
            const faceCheck = await detectFace({ imageUrl: mainPhoto.url });
            if (!faceCheck.hasFace || !faceCheck.isClear) {
                throw new UnprocessableEntityException("Main profile photo must be a clear face image", "MAIN_PHOTO_NO_FACE");
            }

            const result = await sequelize.transaction(async (t) => {
                let profile = await Profile.findOne({ where: { user_id: userId }, transaction: t });
                if (!profile) {
                    profile = await Profile.create({ user_id: userId }, { transaction: t });
                }
                await profile.update(
                    { full_name: fullName, height_cm: heightCm, distance_pref_km: distancePrefKm, ...rest },
                    { transaction: t }
                );

                const [fitnessRow] = await FitnessDetails.findOrCreate({
                    where: { user_id: userId },
                    defaults: { user_id: userId },
                    transaction: t,
                });
                await fitnessRow.update(mapFitnessPayload(fitness), { transaction: t });

                if (lifestyle) {
                    const [lifestyleRow] = await Lifestyle.findOrCreate({
                        where: { user_id: userId },
                        defaults: { user_id: userId },
                        transaction: t,
                    });
                    await lifestyleRow.update(mapLifestylePayload(lifestyle), { transaction: t });
                }

                await UserMedia.update(
                    { is_main_photo: false },
                    { where: { user_id: userId }, transaction: t }
                );

                for (const [idx, mediaId] of uniqueMediaIds.entries()) {
                    await UserMedia.update(
                        {
                            order_index: idx + 1,
                            is_main_photo: mediaId === mainPhotoMediaId,
                            has_face: mediaId === mainPhotoMediaId ? true : undefined,
                        },
                        {
                            where: { user_id: userId, id: mediaId },
                            transaction: t,
                        }
                    );
                }

                await profile.update({ main_profile_photo_id: mainPhotoMediaId }, { transaction: t });

                await VerificationBadge.findOrCreate({
                    where: { user_id: userId },
                    defaults: { user_id: userId, status: "inactive" },
                    transaction: t,
                });

                const activation = await profileService.recomputeActivation(userId, { transaction: t });
                return { profileId: profile.id, activation };
            });

            return res.status(200).json({
                success: true,
                message: "Profile setup complete",
                data: result,
            });
        } catch (error) {
            console.error("Error in setupComplete api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async myProfile(req, res) {
        try {
            const userId = req.user.userId;

            const [profile, fitness, lifestyle, media, badge] = await Promise.all([
                commonService.findOne(Profile, { user_id: userId }),
                commonService.findOne(FitnessDetails, { user_id: userId }),
                commonService.findOne(Lifestyle, { user_id: userId }),
                UserMedia.findAll({ where: { user_id: userId }, order: [["order_index", "ASC"]] }),
                commonService.findOne(VerificationBadge, { user_id: userId }),
            ]);

            if (!profile) throw new NotFoundException("Profile not found", "PROFILE_NOT_FOUND");

            return res.status(200).json({
                success: true,
                message: "Success",
                data: new getProfileResources({ profile, fitness, lifestyle, media, badge }),
            });
        } catch (error) {
            console.error("Error in myProfile api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async getPublicProfile(req, res) {
        try {
            const viewerId = req.user.userId;
            const targetUserId = parseInt(req.params.userId, 10);

            if (viewerId === targetUserId) {
                return profileService.myProfile(req, res);
            }

            const profile = await commonService.findOne(Profile, { user_id: targetUserId, profile_status: "active" });
            if (!profile) throw new NotFoundException("Profile not found", "PROFILE_NOT_FOUND");

            const [fitness, lifestyle, media, badge, viewerProfile] = await Promise.all([
                commonService.findOne(FitnessDetails, { user_id: targetUserId }),
                commonService.findOne(Lifestyle, { user_id: targetUserId }),
                UserMedia.findAll({ where: { user_id: targetUserId }, order: [["order_index", "ASC"]] }),
                commonService.findOne(VerificationBadge, { user_id: targetUserId }),
                commonService.findOne(Profile, { user_id: viewerId }),
            ]);

            const distanceKm = haversineKm(
                viewerProfile?.latitude, viewerProfile?.longitude,
                profile.latitude, profile.longitude
            );

            const safeProfile = profile.toJSON();
            delete safeProfile.latitude;
            delete safeProfile.longitude;

            return res.status(200).json({
                success: true,
                message: "Success",
                data: new getProfileResources({ profile: safeProfile, fitness, lifestyle, media, badge, distanceKm }),
            });
        } catch (error) {
            console.error("Error in getPublicProfile api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async editProfile(data, req, res) {
        try {
            const userId = req.user.userId;
            const profile = await commonService.findOne(Profile, { user_id: userId });
            if (!profile) throw new NotFoundException("Profile not found", "PROFILE_NOT_FOUND");

            await profile.update({
                full_name: data.fullName,
                bio: data.bio,
                height_cm: data.heightCm,
                distance_pref_km: data.distancePrefKm,
            });
            await profileService.recomputeActivation(userId);

            return res.status(200).json({
                success: true,
                message: "Profile updated",
                data: {
                    id: profile.id,
                    fullName: profile.full_name,
                    bio: profile.bio,
                    heightCm: profile.height_cm,
                    distancePrefKm: profile.distance_pref_km,
                    profileStatus: profile.profile_status,
                },
            });
        } catch (error) {
            console.error("Error in editProfile api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async editFitness(data, req, res) {
        try {
            const userId = req.user.userId;
            const [row] = await FitnessDetails.findOrCreate({
                where: { user_id: userId },
                defaults: { user_id: userId },
            });
            await row.update(mapFitnessPayload(data));
            await profileService.recomputeActivation(userId);

            return res.status(200).json({
                success: true,
                message: "Fitness details updated",
                data: {
                    workoutFrequency: row.workout_frequency,
                    intent: row.intent,
                    fitnessGoals: row.fitness_goals,
                    trainingStyles: row.training_styles,
                },
            });
        } catch (error) {
            console.error("Error in editFitness api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async editLifestyle(data, req, res) {
        try {
            const userId = req.user.userId;
            const [row] = await Lifestyle.findOrCreate({
                where: { user_id: userId },
                defaults: { user_id: userId },
            });
            await row.update(mapLifestylePayload(data));
            return res.status(200).json({
                success: true,
                message: "Lifestyle updated",
                data: {
                    smoking: row.smoking,
                    drinking: row.drinking,
                    kids: row.kids,
                    language: row.language,
                    lookingFor: row.looking_for,
                },
            });
        } catch (error) {
            console.error("Error in editLifestyle api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async updateLocation(data, req, res) {
        try {
            const userId = req.user.userId;
            const profile = await commonService.findOne(Profile, { user_id: userId });
            if (!profile) throw new NotFoundException("Profile not found", "PROFILE_NOT_FOUND");
            await profile.update({ latitude: data.latitude, longitude: data.longitude });
            return res.status(200).json({
                success: true,
                message: "Location updated",
                data: { updated: true },
            });
        } catch (error) {
            console.error("Error in updateLocation api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }
}

export default profileService;
