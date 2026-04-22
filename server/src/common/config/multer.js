import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { MAX_FILE_SIZE_PHOTO, MAX_FILE_SIZE_VIDEO } from "../constants/index.js";

const allowedImageMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
const allowedVideoMimes = ["video/mp4", "video/quicktime", "video/x-m4v", "video/webm"];

const makeStorage = (subfolder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const userId = req.user?.id || "anonymous";
            const dir = path.join(process.cwd(), "uploads", subfolder, String(userId));
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}_${uuidv4()}${ext}`);
        },
    });

const fileFilter = (req, file, cb) => {
    if (allowedImageMimes.includes(file.mimetype) || allowedVideoMimes.includes(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error("Unsupported file type"), false);
};

export const userMediaUpload = multer({
    storage: makeStorage("users"),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_VIDEO },
});

export const progressUpload = multer({
    storage: makeStorage("progress"),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_VIDEO },
});

export const isImage = (mimetype) => allowedImageMimes.includes(mimetype);
export const isVideo = (mimetype) => allowedVideoMimes.includes(mimetype);
