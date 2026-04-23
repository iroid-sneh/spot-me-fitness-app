import express from "express";
import asyncWrap from "express-async-wrapper";
import validator from "../common/config/joiValidation.js";
import auth from "../common/middleware/auth.js";
import roleCheck from "../common/middleware/roleCheck.js";
import { loginLimiter } from "../common/middleware/rateLimiter.js";
import adminController from "./admin.controller.js";
import adminLoginDto from "./dtos/adminLoginDtos.js";
import updateUserStatusDto from "./dtos/updateUserStatusDtos.js";
import reviewDto from "./dtos/reviewDtos.js";
import reportActionDto from "./dtos/reportActionDtos.js";
import settingsDto from "./dtos/settingsDtos.js";

const router = express.Router();
const adminOnly = [auth, roleCheck("admin", "super_admin")];

router.post("/auth/login", loginLimiter, validator.body(adminLoginDto), asyncWrap(adminController.login));
router.get("/auth/me", ...adminOnly, asyncWrap(adminController.me));
router.post("/auth/logout", ...adminOnly, asyncWrap(adminController.logout));

router.get("/dashboard/overview", ...adminOnly, asyncWrap(adminController.dashboardOverview));

router.get("/users", ...adminOnly, asyncWrap(adminController.listUsers));
router.get("/users/:id", ...adminOnly, asyncWrap(adminController.getUserDetail));
router.patch("/users/:id/status", ...adminOnly, validator.body(updateUserStatusDto), asyncWrap(adminController.updateUserStatus));
router.post("/users/:id/force-face-verify", ...adminOnly, asyncWrap(adminController.forceFaceVerify));
router.delete("/users/:id", ...adminOnly, asyncWrap(adminController.deleteUser));

router.get("/verifications", ...adminOnly, asyncWrap(adminController.listVerifications));
router.post("/verifications/:id/approve", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.approveVerification));
router.post("/verifications/:id/reject", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.rejectVerification));

router.get("/progress/reviews", ...adminOnly, asyncWrap(adminController.listProgressReviews));
router.post("/progress/:id/approve", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.approveProgress));
router.post("/progress/:id/reject", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.rejectProgress));

router.get("/media/queue", ...adminOnly, asyncWrap(adminController.listMediaQueue));
router.post("/media/:id/approve", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.approveMedia));
router.post("/media/:id/reject", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.rejectMedia));

router.get("/reports", ...adminOnly, asyncWrap(adminController.listReports));
router.get("/reports/:id", ...adminOnly, asyncWrap(adminController.getReport));
router.post("/reports/:id/resolve", ...adminOnly, validator.body(reportActionDto), asyncWrap(adminController.resolveReport));
router.post("/reports/:id/dismiss", ...adminOnly, validator.body(reviewDto), asyncWrap(adminController.dismissReport));

router.get("/financials/overview", ...adminOnly, asyncWrap(adminController.financialOverview));

router.get("/settings", ...adminOnly, asyncWrap(adminController.getSettings));
router.put("/settings", ...adminOnly, validator.body(settingsDto), asyncWrap(adminController.updateSettings));

export default router;
