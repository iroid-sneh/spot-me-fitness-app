import express from "express";
import asyncWrap from "express-async-wrapper";
import authController from "./auth.controller.js";
import auth from "../common/middleware/auth.js";
import validator from "../common/config/joiValidation.js";
import { loginLimiter, otpLimiter, forgotPasswordLimiter, signupLimiter } from "../common/middleware/rateLimiter.js";
import signupDto from "./dtos/signupDtos.js";
import verifyOtpDto from "./dtos/verifyOtpDtos.js";
import loginDto from "./dtos/loginDtos.js";
import forgotPasswordDto from "./dtos/forgotPasswordDtos.js";
import resetPasswordDto from "./dtos/resetPasswordDtos.js";
import resendOtpDto from "./dtos/resendOtpDtos.js";
import faceVerifyDto from "./dtos/faceVerifyDtos.js";

const router = express.Router();

router.post("/signup", signupLimiter, validator.body(signupDto), asyncWrap(authController.signup));
router.post("/verifyotp", validator.body(verifyOtpDto), asyncWrap(authController.verifyOtp));
router.post("/verify-email", validator.body(verifyOtpDto), asyncWrap(authController.verifyOtp));
router.post("/login", loginLimiter, validator.body(loginDto), asyncWrap(authController.login));
router.post("/forgotpassword", forgotPasswordLimiter, validator.body(forgotPasswordDto), asyncWrap(authController.forgotPassword));
router.post("/forgot-password", forgotPasswordLimiter, validator.body(forgotPasswordDto), asyncWrap(authController.forgotPassword));
router.post("/resetpassword", validator.body(resetPasswordDto), asyncWrap(authController.resetPassword));
router.post("/reset-password", validator.body(resetPasswordDto), asyncWrap(authController.resetPassword));
router.post("/resendotp", otpLimiter, validator.body(resendOtpDto), asyncWrap(authController.resendOtp));

router.post("/faceverify", auth, validator.body(faceVerifyDto), asyncWrap(authController.faceVerify));
router.post("/face-verify", auth, validator.body(faceVerifyDto), asyncWrap(authController.faceVerify));
router.post("/logout", auth, asyncWrap(authController.logout));
router.get("/me", auth, asyncWrap(authController.me));

export default router;
