import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import https from "https";
import routes from "./routes/index.js";
import { dbConnection } from "./models/connection.js";
import "./models/index.js";
import swagger from "./src/common/config/swagger.js";
import errorHandler from "./src/common/middleware/errorHandler.js";
import auditLog from "./src/common/middleware/auditLog.js";
import badgeService from "./src/progress/badge.service.js";
import seedDatabase from "./seeder/index.js";
import runChecklist from "./serverChecklist.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

runChecklist();

const app = express();
const port = process.env.PORT || 2003;

dbConnection().then(() => {
    seedDatabase();
    const badgeRefreshMs = 24 * 60 * 60 * 1000;
    setInterval(() => {
        badgeService.recomputeAllBadges().catch((error) => {
            console.error("Badge refresh failed:", error.message);
        });
    }, badgeRefreshMs);
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
    cors({
        origin: process.env.CLIENT_URL === "*" ? "*" : [process.env.CLIENT_URL, process.env.APP_URL_ADMIN].filter(Boolean),
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(auditLog);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", routes);
app.use("/api/documentation", swagger);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found", errorCode: "NOT_FOUND" });
});

app.use(errorHandler);

const isSecure = process.env.IS_SECURE === "true";

if (isSecure) {
    const options = {
        key: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/privkey.pem`),
        cert: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
        ca: [
            fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
            fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/fullchain.pem`),
        ],
    };
    https.createServer(options, app).listen(process.env.PORT, () => {
        console.log(`HTTPS server listening on => ${process.env.BASE_URL}:${process.env.PORT}`);
    });
} else {
    app.listen(port, "0.0.0.0", (err) => {
        if (err) return console.log("Server not connect...");
        console.log(`Listening on port: ${process.env.BASE_URL}:${process.env.PORT}`);
    });
}
