import { Exception, HttpStatus } from "../utils/errorException.js";

export default (err, req, res, next) => {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
        console.error("ERROR:", err);
    }

    if (err?.error?.isJoi) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            message: err.error.details?.[0]?.message || "Validation failed",
            errorCode: "VALIDATION_FAILED",
        });
    }

    if (err?.isJoi) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            message: err.details?.[0]?.message || "Validation failed",
            errorCode: "VALIDATION_FAILED",
        });
    }

    if (err?.name === "SequelizeUniqueConstraintError") {
        return res.status(HttpStatus.CONFLICT).json({
            success: false,
            message: err.errors?.[0]?.message || "Duplicate entry",
            errorCode: "DUPLICATE_ENTRY",
        });
    }

    if (err?.name === "SequelizeValidationError") {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            message: err.errors?.[0]?.message || "Validation failed",
            errorCode: "VALIDATION_FAILED",
        });
    }

    if (err instanceof Exception) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode || null,
        });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong. Please try again later.",
    });
};
