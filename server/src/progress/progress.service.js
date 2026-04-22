import { ProgressCapture } from "../../models/index.js";
import commonService from "../common/utils/common.service.js";
import {
    optimizeImage,
    getVideoDuration,
} from "../common/utils/mediaProcessor.js";
import { safeRelativeUrl, deleteFileSafe, absolutePathFromUrl } from "../common/helper.js";
import { isImage, isVideo } from "../common/config/multer.js";
import {
    PROGRESS_VIDEO_MIN_SEC,
    PROGRESS_VIDEO_MAX_SEC,
    MAX_FILE_SIZE_PHOTO,
} from "../common/constants/index.js";
import {
    BadRequestException,
    NotFoundException,
    UnprocessableEntityException,
} from "../common/utils/errorException.js";
import badgeService from "./badge.service.js";
import getProgressResources, { getBadgeResources } from "./resources/getProgressResources.js";

class progressService {
    static async upload(data, file, req, res) {
        try {
            const userId = req.user.userId;
            if (!file) throw new BadRequestException("No file provided", "FILE_MISSING");

            if (data.source !== "app_internal_camera") {
                deleteFileSafe(file.path);
                throw new BadRequestException(
                    "Progress capture must be recorded live inside the app. Camera roll uploads are not allowed.",
                    "PROGRESS_SOURCE_INVALID"
                );
            }

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
                if (duration_sec < PROGRESS_VIDEO_MIN_SEC || duration_sec > PROGRESS_VIDEO_MAX_SEC) {
                    deleteFileSafe(file.path);
                    throw new BadRequestException(
                        `Progress videos must be between ${PROGRESS_VIDEO_MIN_SEC} and ${PROGRESS_VIDEO_MAX_SEC} seconds`,
                        "VIDEO_DURATION_INVALID"
                    );
                }
                url = safeRelativeUrl(file.path);
                type = "video";
            } else {
                deleteFileSafe(file.path);
                throw new UnprocessableEntityException("Unsupported file type", "FILE_TYPE_INVALID");
            }

            const now = new Date();
            const capture = await commonService.create(ProgressCapture, {
                user_id: userId,
                media_url: url,
                type,
                duration_sec,
                captured_month: now.getMonth() + 1,
                captured_year: now.getFullYear(),
                workout_type: data.workoutType || null,
                caption: data.caption || null,
                source: "app_internal_camera",
                is_raw_verified: true,
                mime_type,
                size_bytes,
            });

            await badgeService.recomputeBadge(userId);

            return res.status(201).json({
                success: true,
                message: "Progress uploaded",
                data: new getProgressResources(capture),
            });
        } catch (error) {
            console.error("Error in progress upload api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async listMine(req, res) {
        try {
            const userId = req.user.userId;
            const list = await ProgressCapture.findAll({
                where: { user_id: userId },
                order: [["created_at", "DESC"]],
            });
            return res.status(200).json({
                success: true,
                message: "Success",
                data: list.map((p) => new getProgressResources(p)),
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

    static async listByUser(req, res) {
        try {
            const targetUserId = parseInt(req.params.userId, 10);
            const list = await ProgressCapture.findAll({
                where: { user_id: targetUserId },
                order: [["created_at", "DESC"]],
            });
            return res.status(200).json({
                success: true,
                message: "Success",
                data: list.map((p) => new getProgressResources(p)),
            });
        } catch (error) {
            console.error("Error in listByUser api:", error);
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
            const id = parseInt(req.params.id, 10);

            const capture = await commonService.findOne(ProgressCapture, { id, user_id: userId });
            if (!capture) throw new NotFoundException("Progress capture not found", "PROGRESS_NOT_FOUND");

            deleteFileSafe(absolutePathFromUrl(capture.media_url));
            await capture.destroy({ force: true });
            await badgeService.recomputeBadge(userId);

            return res.status(200).json({
                success: true,
                message: "Progress capture deleted",
                data: { deleted: true },
            });
        } catch (error) {
            console.error("Error in progress remove api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async badgeStatus(req, res) {
        try {
            const userId = req.user.userId;
            const badge = await badgeService.recomputeBadge(userId);
            return res.status(200).json({
                success: true,
                message: "Success",
                data: new getBadgeResources(badge),
            });
        } catch (error) {
            console.error("Error in badgeStatus api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }
}

export default progressService;
