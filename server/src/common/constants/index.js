export * from "./enums.js";

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;
export const PROFILE_MEDIA_MIN = 4;
export const PROFILE_MEDIA_MAX = 6;
export const VIDEO_MAX_DURATION_SEC = 7;
export const PROGRESS_VIDEO_MIN_SEC = 3;
export const PROGRESS_VIDEO_MAX_SEC = 10;
export const BADGE_ACTIVE_WINDOW_DAYS = 30;
export const MAX_FILE_SIZE_PHOTO = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_VIDEO = 30 * 1024 * 1024;
export const FACE_VERIFY_MAX_ATTEMPTS = 3;

export const JWT = {
    SECRET: process.env.JWT_SECRET || "spot_me_super_secret_change_in_production",
    ACCESS_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "365d",
    REFRESH_EXPIRES_IN: "365d",
};

export const OTP_TYPE = {
    REGISTRATION_OTP: 1,
    FORGOT_PASSWORD: 2,
};

export const OTP_TYPE_VALUES = [OTP_TYPE.REGISTRATION_OTP, OTP_TYPE.FORGOT_PASSWORD];

export const PLATFORM = {
    ANDROID: "Android",
    IOS: "iOS",
};
