import authHelper from "../authHelper.js";
import { User, LoginSession } from "../../../models/index.js";
import { HttpStatus } from "../utils/errorException.js";

const verificationAllowedPaths = new Set([
    "/api/v1/auth/faceverify",
    "/api/v1/auth/face-verify",
    "/faceverify",
    "/face-verify",
    "/api/v1/auth/logout",
    "/logout",
    "/api/v1/auth/me",
    "/me",
]);

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Authorization token missing",
                errorCode: "AUTH_TOKEN_MISSING",
            });
        }

        const token = authHeader.split(" ")[1];

        let payload;
        try {
            payload = await authHelper.getDataFromToken(token);
        } catch (err) {
            const message = err.name === "TokenExpiredError" ? "Session expired. Please login again." : "Invalid token";
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message,
                errorCode: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
            });
        }

        const user = await User.findByPk(payload.user_id);
        if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "User not found",
                errorCode: "USER_NOT_FOUND",
            });
        }

        if (user.account_status === "banned") {
            return res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: "Account is banned",
                errorCode: "ACCOUNT_BANNED",
            });
        }

        if (payload.jti) {
            const session = await LoginSession.findOne({ where: { jti: payload.jti, user_id: user.id } });
            if (!session || session.revoked_at) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Session expired. Please login again.",
                    errorCode: "SESSION_EXPIRED",
                });
            }
            if (session.session_status === "pending_face_verification" && !verificationAllowedPaths.has(req.path)) {
                return res.status(HttpStatus.FORBIDDEN).json({
                    success: false,
                    message: "Face verification is required before you can continue.",
                    errorCode: "FACE_VERIFICATION_REQUIRED",
                });
            }
            await session.update({ last_seen_at: new Date() });
        }

        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            jti: payload.jti,
            instance: user,
        };
        return next();
    } catch (err) {
        return next(err);
    }
};
