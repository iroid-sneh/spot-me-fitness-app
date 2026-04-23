import express from "express";
import authMiddleware from "../src/common/middleware/auth.js";
import authRoutes from "../src/auth/auth.routes.js";
import profileRoutes from "../src/profile/profile.routes.js";
import mediaRoutes from "../src/media/media.routes.js";
import progressRoutes from "../src/progress/progress.routes.js";
import adminRoutes from "../src/admin/admin.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use(authMiddleware);

router.use("/profile", profileRoutes);
router.use("/media", mediaRoutes);
router.use("/progress", progressRoutes);

export default router;
