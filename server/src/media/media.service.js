import { sequelize, UserMedia, Profile } from "../../models/index.js";
import commonService from "../common/utils/common.service.js";
import {
    optimizeImage,
    getVideoDuration,
} from "../common/utils/mediaProcessor.js";
import { safeRelativeUrl, deleteFileSafe, absolutePathFromUrl } from "../common/helper.js";
import { isImage, isVideo } from "../common/config/multer.js";
import { detectFace } from "../common/utils/faceVerify.js";
import { PROFILE_MEDIA_MAX, VIDEO_MAX_DURATION_SEC, MAX_FILE_SIZE_PHOTO } from "../common/constants/index.js";
import {
    BadRequestException,
    NotFoundException,
    ConflictException,
    UnprocessableEntityException,
} from "../common/utils/errorException.js";
import profileService from "../profile/profile.service.js";
import getUserMediaResources from "./resources/getUserMediaResources.js";

class mediaService {
    static async listMine(req, res) {
        try {
            const userId = req.user.userId;
            const media = await UserMedia.findAll({
                where: { user_id: userId },
                order: [["order_index", "ASC"]],
            });
            return res.status(200).json({
                success: true,
                message: "Success",
                data: media.map((m) => new getUserMediaResources(m)),
            });
        } catch (error) {
            console.error("Error in listMine api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async upload(data, file, req, res) {
        try {
            const userId = req.user.userId;
            if (!file) throw new BadRequestException("No file provided", "FILE_MISSING");

            const existingCount = await commonService.count(UserMedia, { user_id: userId });
            if (existingCount >= PROFILE_MEDIA_MAX) {
                deleteFileSafe(file.path);
                throw new ConflictException(
                    `You can have at most ${PROFILE_MEDIA_MAX} media items. Delete one first.`,
                    "MEDIA_LIMIT_REACHED"
                );
            }

            const source = data.source === "app_internal_camera" ? "app_internal_camera" : "camera_roll";
            const isFitness = data.isFitness === true || data.isFitness === "true";

            let url, type, duration_sec = null, mime_type = file.mimetype, size_bytes = file.size;

            if (isImage(file.mimetype)) {
                if (file.size > MAX_FILE_SIZE_PHOTO) {
                    deleteFileSafe(file.path);
                    throw new UnprocessableEntityException("Photo exceeds 10MB size limit", "FILE_TOO_LARGE");
                }
                const result = await optimizeImage(file.path);
                url = safeRelativeUrl(result.path);
                type = "photo";
                mime_type = result.mime_type;
                size_bytes = result.size_bytes;
            } else if (isVideo(file.mimetype)) {
                duration_sec = await getVideoDuration(file.path);
                if (duration_sec > VIDEO_MAX_DURATION_SEC) {
                    deleteFileSafe(file.path);
                    throw new BadRequestException(
                        `Video must be ${VIDEO_MAX_DURATION_SEC} seconds or shorter`,
                        "VIDEO_TOO_LONG"
                    );
                }
                url = safeRelativeUrl(file.path);
                type = "video";
            } else {
                deleteFileSafe(file.path);
                throw new UnprocessableEntityException("Unsupported file type", "FILE_TYPE_INVALID");
            }

            const media = await commonService.create(UserMedia, {
                user_id: userId,
                url,
                type,
                duration_sec,
                is_fitness: isFitness,
                is_main_photo: false,
                order_index: existingCount + 1,
                source,
                mime_type,
                size_bytes,
            });

            await profileService.recomputeActivation(userId);

            return res.status(201).json({
                success: true,
                message: "Media uploaded",
                data: new getUserMediaResources(media),
            });
        } catch (error) {
            console.error("Error in upload api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async setMain(req, res) {
        try {
            const userId = req.user.userId;
            const mediaId = parseInt(req.params.id, 10);

            const media = await commonService.findOne(UserMedia, { id: mediaId, user_id: userId });
            if (!media) throw new NotFoundException("Media not found", "MEDIA_NOT_FOUND");
            if (media.type !== "photo") {
                throw new UnprocessableEntityException("Main profile must be a photo, not a video", "MAIN_PHOTO_INVALID_TYPE");
            }

            const faceCheck = await detectFace({ imageUrl: media.url });
            if (!faceCheck.hasFace || !faceCheck.isClear) {
                throw new UnprocessableEntityException("Main profile photo must be a clear face image", "MAIN_PHOTO_NO_FACE");
            }

            await sequelize.transaction(async (t) => {
                await UserMedia.update({ is_main_photo: false }, { where: { user_id: userId }, transaction: t });
                await media.update({ is_main_photo: true, has_face: true }, { transaction: t });

                const profile = await Profile.findOne({ where: { user_id: userId }, transaction: t });
                if (profile) await profile.update({ main_profile_photo_id: media.id }, { transaction: t });

                await profileService.recomputeActivation(userId, { transaction: t });
            });

            return res.status(200).json({
                success: true,
                message: "Main photo updated",
                data: new getUserMediaResources(media),
            });
        } catch (error) {
            console.error("Error in setMain api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async markFitness(data, req, res) {
        try {
            const userId = req.user.userId;
            const mediaId = parseInt(req.params.id, 10);

            const media = await commonService.findOne(UserMedia, { id: mediaId, user_id: userId });
            if (!media) throw new NotFoundException("Media not found", "MEDIA_NOT_FOUND");

            await media.update({ is_fitness: !!data.isFitness });
            await profileService.recomputeActivation(userId);

            return res.status(200).json({
                success: true,
                message: "Fitness tag updated",
                data: new getUserMediaResources(media),
            });
        } catch (error) {
            console.error("Error in markFitness api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async reorder(data, req, res) {
        try {
            const userId = req.user.userId;
            const { items } = data;

            const ids = items.map((i) => i.id);
            const media = await UserMedia.findAll({ where: { user_id: userId, id: ids } });
            if (media.length !== items.length) {
                throw new UnprocessableEntityException("One or more media items do not belong to you", "MEDIA_OWNERSHIP");
            }

            const orders = items.map((i) => i.orderIndex);
            if (new Set(orders).size !== orders.length) {
                throw new UnprocessableEntityException("orderIndex values must be unique", "REORDER_DUPLICATE");
            }

            await sequelize.transaction(async (t) => {
                for (const it of items) {
                    await UserMedia.update(
                        { order_index: it.orderIndex },
                        { where: { id: it.id, user_id: userId }, transaction: t }
                    );
                }
            });

            const updated = await UserMedia.findAll({
                where: { user_id: userId },
                order: [["order_index", "ASC"]],
            });

            return res.status(200).json({
                success: true,
                message: "Media reordered",
                data: updated.map((m) => new getUserMediaResources(m)),
            });
        } catch (error) {
            console.error("Error in reorder api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async remove(req, res) {
        try {
            const userId = req.user.userId;
            const mediaId = parseInt(req.params.id, 10);

            const media = await commonService.findOne(UserMedia, { id: mediaId, user_id: userId });
            if (!media) throw new NotFoundException("Media not found", "MEDIA_NOT_FOUND");

            await sequelize.transaction(async (t) => {
                if (media.is_main_photo) {
                    const profile = await Profile.findOne({ where: { user_id: userId }, transaction: t });
                    if (profile) await profile.update({ main_profile_photo_id: null }, { transaction: t });
                }
                deleteFileSafe(absolutePathFromUrl(media.url));
                await media.destroy({ transaction: t, force: true });
                await profileService.recomputeActivation(userId, { transaction: t });
            });

            return res.status(200).json({
                success: true,
                message: "Media deleted",
                data: { deleted: true },
            });
        } catch (error) {
            console.error("Error in remove api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }
}

export default mediaService;
