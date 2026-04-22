import express from "express";
import apiRoutes from "./api.js";

const router = express.Router();

router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} — ${res.statusCode} [${duration}ms]`);
    });
    next();
});

router.get("/health", (req, res) => {
    res.json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

router.use("/api/v1", apiRoutes);

export default router;
