import { Op } from "sequelize";
import moment from "moment";
import { User, EmailOTP, LoginSession, FaceVerificationLog, Profile, UserMedia } from "../../models/index.js";
import authHelper from "../common/authHelper.js";
import commonService from "../common/utils/common.service.js";
import { sendOtpMail } from "../common/utils/mailer.js";
import { compareFaces } from "../common/utils/faceVerify.js";
import { OTP_EXPIRY_MINUTES, OTP_TYPE, FACE_VERIFY_MAX_ATTEMPTS } from "../common/constants/index.js";
import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
} from "../common/utils/errorException.js";
import getUserResources from "./resources/getUserResources.js";

class authService {
    static async _createOtp(userId, email, type) {
        await commonService.updateMany(
            EmailOTP,
            { user_id: userId, type, consumed_at: null },
            { consumed_at: new Date() }
        );
        const otp = authHelper.generateOtp(6);
        const expires_at = moment().add(OTP_EXPIRY_MINUTES, "minutes").toDate();
        await commonService.create(EmailOTP, { user_id: userId, otp_code: otp, type, expires_at });
        await sendOtpMail(email, otp, type);
        return otp;
    }

    static async signup(data, req, res) {
        try {
            const { email, password } = data;

            const existingUser = await commonService.findOne(User, { email });
            if (existingUser) {
                throw new ConflictException("Email already registered", "EMAIL_EXISTS");
            }

            const hashedPassword = await authHelper.hashPassword(password);
            const user = await commonService.create(User, {
                email,
                password_hash: hashedPassword,
                is_verified: false,
                account_status: "pending",
            });

            await commonService.create(Profile, { user_id: user.id, profile_status: "pending" });
            await authService._createOtp(user.id, email, OTP_TYPE.REGISTRATION_OTP);

            return res.status(201).json({
                success: true,
                message: "Signup successful. Please verify your email.",
                data: { userId: user.id, email: user.email },
            });
        } catch (error) {
            console.error("Error in signup api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async verifyOtp(data, req, res) {
        try {
            const { email, otp, type } = data;

            const user = await commonService.findOne(User, { email });
            if (!user) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            const record = await EmailOTP.findOne({
                where: {
                    user_id: user.id,
                    otp_code: otp,
                    type,
                    consumed_at: null,
                    expires_at: { [Op.gt]: new Date() },
                },
                order: [["created_at", "DESC"]],
            });

            if (!record) {
                throw new BadRequestException("Invalid or expired OTP", "OTP_INVALID");
            }

            await record.update({ consumed_at: new Date() });

            if (type === OTP_TYPE.REGISTRATION_OTP) {
                if (user.is_verified) {
                    throw new BadRequestException("Email already verified", "ALREADY_VERIFIED");
                }
                await user.update({ is_verified: true, account_status: "active" });

                return res.status(200).json({
                    success: true,
                    message: "Email verified successfully",
                    data: { email: user.email, isVerified: true },
                });
            }

            if (type === OTP_TYPE.FORGOT_PASSWORD) {
                await user.update({ is_forgot_password_verified: true });

                return res.status(200).json({
                    success: true,
                    message: "OTP verified. You can now reset your password.",
                    data: { verified: true },
                });
            }

            throw new BadRequestException("Invalid OTP type", "OTP_TYPE_INVALID");
        } catch (error) {
            console.error("Error in verifyOtp api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async login(data, req, res) {
        try {
            const { email, password, deviceId } = data;

            const user = await commonService.findOne(User, { email });
            if (!user) {
                throw new UnauthorizedException("Invalid credentials", "INVALID_CREDENTIALS");
            }

            const isMatch = await authHelper.matchHashedPassword(password, user.password_hash);
            if (!isMatch) {
                throw new UnauthorizedException("Invalid credentials", "INVALID_CREDENTIALS");
            }

            if (!user.is_verified) {
                throw new ForbiddenException(
                    "Email not verified. Please verify your email first.",
                    "EMAIL_NOT_VERIFIED"
                );
            }

            if (user.account_status === "banned") {
                throw new ForbiddenException("Account is banned", "ACCOUNT_BANNED");
            }

            const hasExistingDeviceSession = deviceId
                ? !!(await LoginSession.findOne({ where: { user_id: user.id, device_id: deviceId, revoked_at: null } }))
                : false;

            const requiresFaceVerify =
                user.account_status === "flagged" ||
                user.face_verified_status === "pending" ||
                (deviceId && !hasExistingDeviceSession);

            const tokens = await authHelper.tokensGenerator(user.id, { role: user.role });

            await commonService.create(LoginSession, {
                user_id: user.id,
                jti: tokens.jti,
                device_id: deviceId || null,
                ip_address: req?.ip,
                user_agent: req?.headers?.["user-agent"],
                last_seen_at: new Date(),
            });

            await user.update({ last_login_at: new Date() });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    tokenType: "Bearer",
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn,
                    requiresFaceVerification: requiresFaceVerify,
                    ...new getUserResources(user),
                },
            });
        } catch (error) {
            console.error("Error in login api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async forgotPassword(data, req, res) {
        try {
            const { email } = data;

            const user = await commonService.findOne(User, { email });
            if (user) {
                await user.update({ is_forgot_password_verified: false });
                await authService._createOtp(user.id, email, OTP_TYPE.FORGOT_PASSWORD);
            }

            return res.status(200).json({
                success: true,
                message: "If an account exists, an OTP has been sent.",
                data: { sent: true },
            });
        } catch (error) {
            console.error("Error in forgotPassword api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async resetPassword(data, req, res) {
        try {
            const { email, password, confirmPassword } = data;

            if (password !== confirmPassword) {
                throw new BadRequestException("Password and Confirm Password do not match", "PASSWORD_MISMATCH");
            }

            const user = await commonService.findOne(User, { email });
            if (!user) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            if (!user.is_forgot_password_verified) {
                throw new BadRequestException(
                    "Please verify the OTP before resetting your password.",
                    "FORGOT_PASSWORD_NOT_VERIFIED"
                );
            }

            const hashedPassword = await authHelper.hashPassword(password);
            await user.update({
                password_hash: hashedPassword,
                is_forgot_password_verified: false,
            });

            await commonService.updateMany(
                LoginSession,
                { user_id: user.id, revoked_at: null },
                { revoked_at: new Date() }
            );

            return res.status(200).json({
                success: true,
                message: "Your new password is now active.",
                data: { reset: true },
            });
        } catch (error) {
            console.error("Error in resetPassword api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async resendOtp(data, req, res) {
        try {
            const { email, type } = data;

            const user = await commonService.findOne(User, { email });
            if (!user) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            if (type === OTP_TYPE.REGISTRATION_OTP && user.is_verified) {
                throw new BadRequestException("Email already verified", "ALREADY_VERIFIED");
            }

            await authService._createOtp(user.id, email, type);

            return res.status(200).json({
                success: true,
                message: "OTP sent",
                data: { sent: true },
            });
        } catch (error) {
            console.error("Error in resendOtp api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async faceVerify(data, req, res) {
        try {
            const { imageUrl } = data;
            const userId = req.user.userId;

            const user = await commonService.findById(User, userId);
            if (!user) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            const profile = await commonService.findOne(Profile, { user_id: userId });
            let reference = null;
            if (profile?.main_profile_photo_id) {
                reference = await commonService.findById(UserMedia, profile.main_profile_photo_id);
            }

            const recentFails = await commonService.count(FaceVerificationLog, {
                user_id: userId,
                result: "fail",
                created_at: { [Op.gt]: moment().subtract(1, "hour").toDate() },
            });

            const result = await compareFaces({
                liveImageUrl: imageUrl,
                referenceImageUrl: reference?.url,
            });

            await commonService.create(FaceVerificationLog, {
                user_id: userId,
                attempt_image_url: imageUrl,
                matched_against_media_id: reference?.id || null,
                result: result.match ? "pass" : "fail",
                confidence: result.confidence,
                attempt_count: recentFails + 1,
                provider: result.provider,
            });

            if (result.match) {
                await user.update({ face_verified_status: "approved" });
                return res.status(200).json({
                    success: true,
                    message: "Face verification successful",
                    data: { verified: true, confidence: result.confidence },
                });
            }

            const totalFails = recentFails + 1;
            if (totalFails >= FACE_VERIFY_MAX_ATTEMPTS) {
                await user.update({ face_verified_status: "failed", account_status: "flagged" });
                throw new ForbiddenException(
                    "Face verification failed multiple times. Your account has been flagged for review.",
                    "FACE_VERIFY_FLAGGED"
                );
            }

            throw new UnauthorizedException("Face verification failed", "FACE_VERIFY_FAILED");
        } catch (error) {
            console.error("Error in faceVerify api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
                errorCode: error.errorCode || null,
            });
        }
    }

    static async logout(req, res) {
        try {
            const jti = req.user?.jti;
            if (jti) {
                await commonService.updateMany(
                    LoginSession,
                    { jti, user_id: req.user.userId },
                    { revoked_at: new Date() }
                );
            }
            return res.status(200).json({
                success: true,
                message: "Logged out successfully",
                data: { loggedOut: true },
            });
        } catch (error) {
            console.error("Error in logout api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    static async me(req, res) {
        try {
            const user = await commonService.findById(User, req.user.userId);
            if (!user) throw new NotFoundException("User not found", "USER_NOT_FOUND");

            return res.status(200).json({
                success: true,
                message: "Success",
                data: { ...new getUserResources(user) },
            });
        } catch (error) {
            console.error("Error in me api:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}

export default authService;
