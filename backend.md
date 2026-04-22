# Backend Architecture Guide — iRoid

> Reference document for this project AND the starting template for every new Node.js + Express + Sequelize backend.
> When starting a new project, copy the patterns here exactly. Do not improvise the structure.

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Folder Structure](#2-folder-structure)
3. [Request Lifecycle (How Things Flow)](#3-request-lifecycle-how-things-flow)
4. [app.js — Entry Point Rules](#4-appjs--entry-point-rules)
5. [Server Checklist (Pre-Start Validation)](#5-server-checklist-pre-start-validation)
6. [Database — Connection & Sync Rules](#6-database--connection--sync-rules)
7. [Models — Data Type Rules](#7-models--data-type-rules)
8. [Error Handling — Typed Exception Pattern](#8-error-handling--typed-exception-pattern)
9. [Routes & Middleware Stack](#9-routes--middleware-stack)
10. [Controllers, Services, Resources Pattern](#10-controllers-services-resources-pattern)
11. [Shared Utilities (commonService, authHelper, helper)](#11-shared-utilities-commonservice-authhelper-helper)
12. [Seeder Pattern](#12-seeder-pattern)
13. [Environment Variables (.env)](#13-environment-variables-env)
14. [ES6 Modules, Babel, dotenv Load Order](#14-es6-modules-babel-dotenv-load-order)
15. [Production Setup (HTTPS + SSL)](#15-production-setup-https--ssl)
16. [Swagger / OpenAPI Documentation Pattern](#16-swagger--openapi-documentation-pattern)
17. [New Project Checklist](#17-new-project-checklist)

---

## 1. Stack Overview

| Layer | Technology |
|---|---|
| Runtime | Node.js (18+) |
| Framework | Express.js |
| ORM | Sequelize v6 |
| Database | MySQL (mysql2 driver) |
| Auth | JWT (jsonwebtoken) + Argon2 password hashing |
| Validation | Joi + express-joi-validation |
| Async route wrapper | express-async-wrapper |
| File Uploads | Multer + sharp (image optimization) + fluent-ffmpeg (video) |
| API Docs | Swagger UI (yamljs + swagger-ui-express, single `swagger.yaml`) |
| Real-time | Socket.io (when needed) |
| Push Notifications | Firebase Admin SDK |
| Mail | nodemailer + ejs templates |
| Date math | moment |
| Rate limiting | express-rate-limit |
| Security headers | helmet |
| ES6 Transpile | Babel (@babel/register) — native ESM via `"type": "module"` |
| Environment | dotenv (loaded via `-r dotenv/config`) |

**Default deps to install:**
```bash
npm install express sequelize mysql2 dotenv cors helmet \
    jsonwebtoken argon2 \
    joi express-joi-validation express-async-wrapper@^0.1.0 \
    multer sharp fluent-ffmpeg \
    moment uuid \
    nodemailer ejs \
    express-rate-limit \
    swagger-ui-express yamljs \
    firebase-admin

npm install --save-dev @babel/core @babel/preset-env @babel/register nodemon
```

> **Note:** `express-async-wrapper` is stuck at `0.1.0` on npm — pin it explicitly or npm picks up nothing. The default caret range `^0.1.0` works.

---

## 2. Folder Structure

```
<project-root>/
├── app.js                               ← Entry point. HTTPS/HTTP server, middleware stack
├── serverChecklist.js                   ← Pre-start validation (run before app starts)
├── swagger.yaml                         ← SINGLE OpenAPI spec file (see Section 16)
├── package.json                         ← MUST contain `"type": "module"`
├── .babelrc                             ← Babel config for ES6 import/export
├── .env                                 ← Local environment variables (never commit)
├── .gitignore
│
├── models/
│   ├── connection.js                    ← Sequelize instance + dbConnection()
│   ├── index.js                         ← All model imports + associations
│   ├── User.js
│   └── ...                              ← One file per model
│
├── routes/
│   ├── index.js                         ← Mounts /api/v1, request timing middleware
│   └── api.js                           ← Aggregates all feature routes
│
├── seeder/
│   └── index.js                         ← Idempotent seed: users, defaults, lookup data
│
├── src/
│   ├── common/
│   │   ├── authHelper.js                ← argon2 hashing + JWT generation (class)
│   │   ├── helper.js                    ← baseUrl, distance, file path helpers
│   │   ├── config/
│   │   │   ├── db.config.js             ← MySQL config (pool + underscored:true)
│   │   │   ├── swagger.js               ← swagger-ui-express mount (uses yamljs)
│   │   │   ├── joiValidation.js         ← express-joi-validation validator
│   │   │   ├── multer.js                ← Upload storage + file filters
│   │   │   └── firebase.js              ← Firebase Admin SDK init
│   │   ├── constants/
│   │   │   ├── enums.js                 ← All string enums (statuses, types, genders, etc.)
│   │   │   └── index.js                 ← Numeric constants, JWT config, re-exports enums
│   │   ├── middleware/
│   │   │   ├── auth.js                  ← JWT verify + session revocation check
│   │   │   ├── errorHandler.js          ← Global error handler (typed exceptions + Joi)
│   │   │   ├── auditLog.js              ← Wraps res.json for audit trail
│   │   │   ├── roleCheck.js             ← Role-based authorization
│   │   │   └── rateLimiter.js           ← Named rate limiters (login/signup/otp/forgot)
│   │   └── utils/
│   │       ├── errorException.js        ← Full typed exception family + HttpStatus
│   │       ├── common.service.js        ← Generic Sequelize wrapper (findOne/create/paginate/...)
│   │       ├── mailer.js                ← nodemailer send + template helpers
│   │       └── mediaProcessor.js        ← sharp WebP pipeline + ffmpeg duration
│   │
│   ├── auth/                            ← Feature module pattern
│   │   ├── auth.routes.js               ← validator.body(dto) + asyncWrap(controller.method)
│   │   ├── auth.controller.js           ← class <name>Controller { static async method(req, res) }
│   │   ├── auth.service.js              ← class <name>Service { static async method(data, req, res) }
│   │   ├── dtos/
│   │   │   ├── signupDtos.js            ← ONE Joi schema per endpoint (separate files)
│   │   │   ├── loginDtos.js
│   │   │   ├── verifyOtpDtos.js
│   │   │   └── ...
│   │   └── resources/
│   │       └── getUserResources.js      ← class transformer (constructor returns API-shaped object)
│   │
│   ├── <otherFeature>/                  ← Same 5-part shape as above
│   │   ├── <feature>.routes.js
│   │   ├── <feature>.controller.js
│   │   ├── <feature>.service.js
│   │   ├── dtos/*Dtos.js
│   │   └── resources/get*Resources.js
│   │
│   └── fcm/
│       └── firebase-adminsdk.json       ← Service account key (never commit to git)
│
├── public/                              ← Static assets
└── uploads/                             ← User file uploads
    ├── users/
    └── progress/
```

**Key conventions:**
- **One file per endpoint DTO** — `signupDtos.js`, not a single `auth.validation.js`
- **Resources are transformer classes** — one per response shape under `resources/`
- **Services and controllers are `class` with `static async` methods** — not plain functions
- **File names follow hesap style**: lowercase + camelCase, suffixed: `<feature>.controller.js`, `*Dtos.js`, `get*Resources.js`

---

## 3. Request Lifecycle (How Things Flow)

```
Client Request
     │
     ▼
app.js
  ├── helmet()
  ├── express.static (public, uploads)
  ├── express.json + express.urlencoded
  ├── cors()
  ├── auditLog middleware (wraps res.json to log after response)
     │
     ▼
routes/index.js
  ├── Request timing middleware (logs duration)
  ├── GET /health
  └── Mounts → /api/v1 → routes/api.js
                              │
                              ▼
                         routes/api.js
                           ├── Public: /auth → auth.routes.js
                           └── Protected (auth middleware first):
                               ├── /profile
                               ├── /media
                               ├── /progress
                               └── ...
                                        │
                                        ▼
                                Feature Router (e.g. auth.routes.js)
                                  ├── rateLimiter (where applicable)
                                  ├── validator.body(dto)   ← Joi schema check
                                  ├── storeFiles / multer   ← if multipart upload
                                  └── asyncWrap(controller.method)
                                          │
                                          ▼
                                    Controller (class, static method)
                                      └── return await service.method(req.body, req, res)
                                              │
                                              ▼
                                        Service (class, static method)
                                          ├── try {
                                          │     - validate business rules
                                          │     - call commonService / models
                                          │     - transform via `new getXResources(row)`
                                          │     - return res.status(200).json({ success, message, data })
                                          │   }
                                          │ catch (error) {
                                          │     - console.error("Error in <x> api:", error)
                                          │     - return res.status(error.statusCode || 500).json({ success:false, message, errorCode })
                                          │   }
     │
     ▼ (uncaught errors bubble up via next(err) from asyncWrap)
errorHandler middleware (app.js last)
     │
     ▼
Client Response
```

**The core decision:** services respond **directly** via `res.status().json()` and catch their own errors inside `try/catch`. The global error handler only catches Joi validation errors (via `passError: true`) and anything that slipped past the service-level catch.

---

## 4. app.js — Entry Point Rules

**Always follow this exact structure:**

```javascript
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
import "./models/index.js";                       // load associations
import swagger from "./src/common/config/swagger.js";
import errorHandler from "./src/common/middleware/errorHandler.js";
import auditLog from "./src/common/middleware/auditLog.js";
import seedDatabase from "./seeder/index.js";
import runChecklist from "./serverChecklist.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

runChecklist();

const app = express();
const port = process.env.PORT || 2003;

dbConnection().then(() => {
    seedDatabase();
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
```

**Rules:**
- `dotenv.config()` at the top — but because ESM hoists imports, the npm scripts must ALSO use `-r dotenv/config` (see Section 14)
- `runChecklist()` runs immediately after imports — before DB, before server start
- `dbConnection().then(() => seedDatabase())` — seed only after DB is ready
- Error handler is the last `app.use()` always
- HTTP branch always binds to `0.0.0.0` for LAN/Docker access
- `__dirname` must be manually constructed from `import.meta.url` in ESM
- `.js` extensions required on every relative import (ESM rule)

---

## 5. Server Checklist (Pre-Start Validation)

Create `serverChecklist.js` at the project root. This runs before the server starts and aborts on any failure.

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function runChecklist() {
    console.log("Running Server Deployment Checklist...\n");

    const checklist = [];

    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) {
        checklist.push("Missing .env file.");
    }

    const requiredEnvKeys = [
        "ENV", "BASE_URL", "CLIENT_URL", "IS_SECURE",
        "APP_URL_ADMIN", "APP_URL", "APP_NAME",
        "PORT", "SSL_CERT_BASE_PATH",
        "JWT_SECRET", "JWT_EXPIRES_IN", "NODE_ENV",
        "DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME", "DB_DIALECT",
        "MAIL_HOST", "MAIL_PORT", "MAIL_USER", "MAIL_PASS",
        "FIREBASE_SERVICE_ACCOUNT",
    ];

    const envContent = fs.existsSync(envPath)
        ? fs.readFileSync(envPath, "utf8").split("\n")
        : [];

    const presentKeys = envContent
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => line.split("=")[0].trim());

    requiredEnvKeys.forEach((key) => {
        if (!presentKeys.includes(key)) checklist.push(`ENV key missing: ${key}`);
    });
    presentKeys.forEach((key) => {
        if (!requiredEnvKeys.includes(key)) checklist.push(`Extra ENV key found: ${key}`);
    });

    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
        try { fs.mkdirSync(uploadPath, { recursive: true }); }
        catch (err) { checklist.push(`Failed to create uploads folder: ${err.message}`); }
    }

    if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
        checklist.push("node_modules not found. Run `npm install`.");
    }

    const pkgPath = path.join(__dirname, "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (!pkg.scripts?.start) checklist.push("Missing start script in package.json.");
    } else {
        checklist.push("package.json not found.");
    }

    if (process.env.IS_SECURE === "true") {
        const sslBase = process.env.SSL_CERT_BASE_PATH;
        if (!sslBase) {
            checklist.push("IS_SECURE=true but SSL_CERT_BASE_PATH is not set.");
        } else {
            ["privkey.pem", "cert.pem", "fullchain.pem"].forEach((file) => {
                if (!fs.existsSync(path.join(sslBase, file))) {
                    checklist.push(`SSL cert missing: ${sslBase}/${file}`);
                }
            });
        }
    }

    if (checklist.length > 0) {
        console.log("\nChecklist FAILED with the following issues:\n");
        checklist.forEach((msg) => console.log(`  - ${msg}`));
        console.log("\nServer startup aborted. Fix the above issues.\n");
        process.exit(1);
    } else {
        console.log("All pre-checks passed. Starting the server...\n");
    }
}
```

**Adding a new env key = add it to BOTH `.env` AND `requiredEnvKeys` in this file.** Keep them in sync.

---

## 6. Database — Connection & Sync Rules

**`models/connection.js`:**

```javascript
import dbConfig from "../src/common/config/db.config.js";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define,
});

export const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL Database connected successfully.");

        if (process.env.NODE_ENV === "development") {
            try {
                await sequelize.sync({ alter: { drop: false } });
            } catch {
                console.warn("alter sync failed — falling back to create-only sync.");
                await sequelize.sync({ force: false });
            }
        } else {
            await sequelize.sync({ force: false });
        }

        console.log("All models synced.");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default sequelize;
```

**`src/common/config/db.config.js`:**

```javascript
export default {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DB: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        charset: "utf8mb4",
    },
    define: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        underscored: true,        // ← createdAt → created_at, updatedAt → updated_at, deletedAt → deleted_at
    },
};
```

**Rules:**
- `underscored: true` is mandatory — it makes Sequelize write `created_at`/`updated_at`/`deleted_at` columns, matching snake_case table convention
- Development: `alter: { drop: false }` — adds new columns without dropping existing data
- Production: `force: false` — create tables only if they don't exist, never alter
- NEVER use `force: true` — it drops all tables
- NEVER use `alter: true` (without `drop: false`) in production — it can hit MySQL's 64-index-per-table limit
- `process.exit(1)` if DB authentication fails — do not let the server run without a DB

---

## 7. Models — Data Type Rules

**Golden Rule: Default to `DataTypes.TEXT`. Use `DataTypes.STRING` only when you have a strict, known maximum length.**

| Field Type | Use | When |
|---|---|---|
| `DataTypes.TEXT` | Names, descriptions, notes, URLs, addresses, reasons, summaries | Most text fields |
| `DataTypes.STRING(n)` | Fixed-format codes: currency (3), phone (20), status enums stored as strings | When length is truly fixed and small |
| `DataTypes.INTEGER` | IDs, counts, scores, whole numbers | |
| `DataTypes.DECIMAL(m, d)` | Money, percentages, lat/lng | |
| `DataTypes.BOOLEAN` | Flags | |
| `DataTypes.DATE` / `DataTypes.DATEONLY` | Timestamps / date-only | |
| `DataTypes.ENUM(...)` | Closed, fixed option sets | Avoid — prefer `STRING(n)` + validation in Joi |
| `DataTypes.JSON` | Arrays, objects | |

**Why TEXT over STRING:**
- `STRING` defaults to `VARCHAR(255)` — emails, URLs, names can exceed 255 chars
- Changing `STRING` to `TEXT` later requires a migration
- `TEXT` has no length constraint and no performance difference for typical data volumes
- If a field could ever hold a paragraph, URL, or formatted content — use `TEXT`

**Examples:**

```javascript
// WRONG — default STRING(255) too small for long content
requirementSummary: { type: DataTypes.STRING },
upworkJobUrl: { type: DataTypes.STRING },
notes: { type: DataTypes.STRING },

// CORRECT
requirementSummary: { type: DataTypes.TEXT, allowNull: true },
upworkJobUrl: { type: DataTypes.TEXT, allowNull: true },
notes: { type: DataTypes.TEXT, allowNull: true },

// OK as STRING — fixed short codes
currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "USD" },
phone: { type: DataTypes.STRING(20), allowNull: true },
status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "pending" },
```

**Model file template:**

```javascript
import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const ModelName = sequelize.define(
    "ModelName",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // Prefer snake_case attribute names so JS and DB column match 1:1
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        full_name: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
        tableName: "model_names",   // plural, snake_case
        timestamps: true,           // With underscored: true → created_at / updated_at
        paranoid: true,             // With underscored: true → deleted_at (soft delete)
    }
);

export default ModelName;
```

**Attribute naming:**
- We define attributes in **snake_case** (`user_id`, `full_name`) so JS model and DB column match 1:1. No surprises in raw queries.
- Resources convert to camelCase for the API response (Section 10).
- Timestamp columns (`created_at`, `updated_at`, `deleted_at`) are handled automatically by `underscored: true` in `db.config.js`.

**`models/index.js` — associations only:**

```javascript
import sequelize from "./connection.js";
import User from "./User.js";
import Profile from "./Profile.js";
// ...

User.hasOne(Profile, { foreignKey: "user_id", as: "profile", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });
// ...

export { sequelize, User, Profile, /* ... */ };
```

---

## 8. Error Handling — Typed Exception Pattern

**Rule: throw typed exceptions from services. Never `res.status(500).json(...)` directly. Services wrap business logic in `try/catch` and respond with a consistent envelope from the catch block.**

### `src/common/utils/errorException.js` — the full family

```javascript
export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    PRECONDITION_FAILED: 412,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

export class Exception extends Error {
    constructor(message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, errorCode = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends Exception {
    constructor(message = "Bad request", errorCode = null) { super(message, HttpStatus.BAD_REQUEST, errorCode); }
}
export class UnauthorizedException extends Exception {
    constructor(message = "Unauthorized", errorCode = null) { super(message, HttpStatus.UNAUTHORIZED, errorCode); }
}
export class ForbiddenException extends Exception {
    constructor(message = "Access denied", errorCode = null) { super(message, HttpStatus.FORBIDDEN, errorCode); }
}
export class NotFoundException extends Exception {
    constructor(message = "Resource not found", errorCode = null) { super(message, HttpStatus.NOT_FOUND, errorCode); }
}
export class ConflictException extends Exception {
    constructor(message = "Conflict", errorCode = null) { super(message, HttpStatus.CONFLICT, errorCode); }
}
export class GoneException extends Exception {
    constructor(message = "Gone", errorCode = null) { super(message, HttpStatus.GONE, errorCode); }
}
export class PreconditionFailedException extends Exception {
    constructor(message = "Precondition failed", errorCode = null) { super(message, HttpStatus.PRECONDITION_FAILED, errorCode); }
}
export class UnprocessableEntityException extends Exception {
    constructor(message = "Unprocessable entity", errorCode = null) { super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode); }
}
export class TooManyRequestsException extends Exception {
    constructor(message = "Too many requests", errorCode = null) { super(message, HttpStatus.TOO_MANY_REQUESTS, errorCode); }
}
export class InternalServerErrorException extends Exception {
    constructor(message = "Internal server error", errorCode = null) { super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode); }
}
export class ValidationException extends Exception {
    constructor(message = "Validation failed", errorCode = "VALIDATION_FAILED") { super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode); }
}
```

### `src/common/middleware/errorHandler.js`

```javascript
import { Exception, HttpStatus } from "../utils/errorException.js";

export default (err, req, res, next) => {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) console.error("ERROR:", err);

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
```

### Usage in services

```javascript
import {
    BadRequestException, ConflictException, NotFoundException,
    UnauthorizedException, ForbiddenException,
} from "../common/utils/errorException.js";

// Inside a service method's try block:
throw new ConflictException("Email already registered", "EMAIL_EXISTS");
throw new NotFoundException("User not found", "USER_NOT_FOUND");
throw new UnauthorizedException("Invalid credentials", "INVALID_CREDENTIALS");
throw new BadRequestException("Invalid or expired OTP", "OTP_INVALID");
throw new ForbiddenException("Email not verified.", "EMAIL_NOT_VERIFIED");
```

### Response envelopes (always)

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```
**Error:**
```json
{ "success": false, "message": "...", "errorCode": "UPPER_SNAKE_CODE_OR_NULL" }
```

---

## 9. Routes & Middleware Stack

**`routes/index.js`:**

```javascript
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
```

**`routes/api.js`:**

```javascript
import express from "express";
import authMiddleware from "../src/common/middleware/auth.js";
import authRoutes from "../src/auth/auth.routes.js";
import profileRoutes from "../src/profile/profile.routes.js";
// ... more feature routers

const router = express.Router();

// Public
router.use("/auth", authRoutes);

// Protected (all routes below)
router.use(authMiddleware);
router.use("/profile", profileRoutes);
// ...

export default router;
```

**Feature routes — `<feature>.routes.js`:**

```javascript
import express from "express";
import asyncWrap from "express-async-wrapper";
import authController from "./auth.controller.js";
import auth from "../common/middleware/auth.js";
import validator from "../common/config/joiValidation.js";
import { loginLimiter, signupLimiter } from "../common/middleware/rateLimiter.js";
import signupDto from "./dtos/signupDtos.js";
import loginDto from "./dtos/loginDtos.js";

const router = express.Router();

router.post("/signup", signupLimiter, validator.body(signupDto), asyncWrap(authController.signup));
router.post("/login", loginLimiter, validator.body(loginDto), asyncWrap(authController.login));
router.post("/logout", auth, asyncWrap(authController.logout));
router.get("/me", auth, asyncWrap(authController.me));

export default router;
```

**Route middleware order (always):**
1. Rate limiter (where applicable)
2. `validator.body(dto)` — Joi schema check
3. `multer.single("file")` / `storeFiles(...)` — if multipart upload
4. `auth` middleware — if authenticated route (when not already applied at parent level)
5. `asyncWrap(controller.method)` — catches async errors

### `src/common/config/joiValidation.js`

```javascript
import expressJoiValidation from "express-joi-validation";

const validator = expressJoiValidation.createValidator({
    passError: true,    // pass Joi error to errorHandler instead of returning 400 directly
});

export default validator;
```

### DTO file shape — `src/<feature>/dtos/<endpoint>Dtos.js`

**One file per endpoint.** Filename ends with `Dtos.js`. Export default a Joi schema object.

```javascript
// signupDtos.js
import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().min(8).max(128).required().label("password"),
});
```

```javascript
// loginDtos.js
import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().required().label("password"),
    deviceId: Joi.string().optional().label("deviceId"),
});
```

### Rate limiter — `src/common/middleware/rateLimiter.js`

```javascript
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please try again later.", errorCode: "RATE_LIMITED" },
});

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP requests. Please wait and try again.", errorCode: "RATE_LIMITED" },
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many password reset requests.", errorCode: "RATE_LIMITED" },
});

export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many signup attempts.", errorCode: "RATE_LIMITED" },
});
```

---

## 10. Controllers, Services, Resources Pattern

This is the **core pattern** that every feature module must follow.

### Controller — thin wrapper, class with `static async` methods

Controllers are one-liners: they extract `req.body` / `req.file` / `req.params` and delegate to the service.

```javascript
// src/auth/auth.controller.js
import authService from "./auth.service.js";

class authController {
    static async signup(req, res) {
        return await authService.signup(req.body, req, res);
    }

    static async login(req, res) {
        return await authService.login(req.body, req, res);
    }

    static async faceVerify(req, res) {
        return await authService.faceVerify(req.body, req, res);
    }

    static async logout(req, res) {
        return await authService.logout(req, res);
    }
}

export default authController;
```

**Rules:**
- **Class lowercase naming**: `class authController` (yes, lowercase first letter — our convention)
- **All methods are `static async`** — no `new authController()` ever
- **No try/catch in controllers** — the service handles errors
- **Controllers return the service call** — don't swallow the return value

### Service — the business logic, class with `static async` methods

Services take `(data, req, res)` — or `(data, file, req, res)` for uploads, or `(req, res)` when there's no body — and respond directly via `res.status().json()`.

```javascript
// src/auth/auth.service.js
import argon2 from "argon2";
import commonService from "../common/utils/common.service.js";
import authHelper from "../common/authHelper.js";
import { User, Profile } from "../../models/index.js";
import { ConflictException, NotFoundException, UnauthorizedException } from "../common/utils/errorException.js";
import getUserResources from "./resources/getUserResources.js";

class authService {
    static async signup(data, req, res) {
        try {
            const { email, password } = data;

            const existing = await commonService.findOne(User, { email });
            if (existing) {
                throw new ConflictException("Email already registered", "EMAIL_EXISTS");
            }

            const password_hash = await authHelper.hashPassword(password);
            const user = await commonService.create(User, { email, password_hash });
            await commonService.create(Profile, { user_id: user.id, profile_status: "pending" });

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

    static async login(data, req, res) {
        try {
            const { email, password } = data;
            const user = await commonService.findOne(User, { email });
            if (!user) throw new UnauthorizedException("Invalid credentials", "INVALID_CREDENTIALS");

            const ok = await authHelper.matchHashedPassword(password, user.password_hash);
            if (!ok) throw new UnauthorizedException("Invalid credentials", "INVALID_CREDENTIALS");

            const tokens = await authHelper.tokensGenerator(user.id, { role: user.role });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    tokenType: "Bearer",
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn,
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
}

export default authService;
```

**Rules:**
- **`class <name>Service`** (lowercase, camelCase) with `static async` methods
- **Signature**: `(data, req, res)` for JSON body, `(data, file, req, res)` for uploads, `(req, res)` when no body is parsed
- **Every method wrapped in `try/catch`** — services never let errors bubble up
- **Throw typed exceptions inside `try`** — they are caught by the same `catch` that builds the error response
- **Respond directly with `res.status().json()`** — no centralized `success()` / `error()` helper
- **When calling another static method of the same class, use the class name explicitly** — `authService._createOtp(...)`, NOT `this._createOtp(...)`. Reason: controllers call service methods as callbacks from Express, `this` binding is lost.
- **Private helpers prefixed with `_`**: `static async _createOtp(...)` — naming convention, not enforced

### Resource — transformer class, shapes model → API response

Resources are **classes with a constructor that returns the API-shaped object**. One file per resource under `src/<feature>/resources/`.

```javascript
// src/auth/resources/getUserResources.js
import { baseUrl } from "../../common/helper.js";

export default class getUserResources {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.isVerified = data.is_verified;                       // ← snake_case from DB → camelCase for API
        this.faceVerifiedStatus = data.face_verified_status;
        this.accountStatus = data.account_status;
        this.role = data.role;
        this.lastLoginAt = data.last_login_at;
    }
}
```

Resources that return an object (instead of using `this`) let you use `new getXResources(row)` as a literal value:

```javascript
// src/media/resources/getUserMediaResources.js
import { baseUrl } from "../../common/helper.js";

export default class getUserMediaResources {
    constructor(data) {
        return {
            id: data.id,
            userId: data.user_id,
            url: data.url ? (data.url.startsWith("http") ? data.url : baseUrl(data.url)) : null,
            type: data.type,
            isFitness: data.is_fitness,
            isMainPhoto: data.is_main_photo,
            orderIndex: data.order_index,
        };
    }
}
```

### Usage in services

```javascript
// Single item
return res.status(200).json({
    success: true,
    message: "Success",
    data: new getUserResources(user),
});

// Spread into a larger response
return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
        tokenType: "Bearer",
        accessToken,
        refreshToken,
        ...new getUserResources(user),
    },
});

// Collection
return res.status(200).json({
    success: true,
    message: "Success",
    data: list.map((row) => new getUserMediaResources(row)),
});
```

**Rules for resources:**
- **One file per response shape** in `resources/`
- **File name starts with `get`**: `getUserResources.js`, `getProfileResources.js`, `getUserMediaResources.js`
- **Class name matches file name** (lowercase first letter)
- **Convert snake_case DB keys → camelCase API keys** inside the resource
- **Handle null safety and URL prefixing** (`baseUrl()`) inside the resource — services don't think about it
- **Resources do NOT hit the DB** — if related data is needed, the service must load it first and pass it in as part of `data`

---

## 11. Shared Utilities (`commonService`, `authHelper`, `helper`)

### `src/common/utils/common.service.js` — generic Sequelize wrapper

Use this instead of sprinkling `Model.findOne({ where: ... })` all over the codebase. Keeps services readable.

```javascript
class commonService {
    static async findOne(model, where, options = {}) {
        return await model.findOne({ where, ...options });
    }

    static async findAll(model, where = {}, options = {}) {
        return await model.findAll({ where, ...options });
    }

    static async findById(model, id, options = {}) {
        return await model.findByPk(id, options);
    }

    static async create(model, data, options = {}) {
        return await model.create(data, options);
    }

    static async bulkCreate(model, rows, options = {}) {
        return await model.bulkCreate(rows, options);
    }

    static async updateOne(model, where, data, options = {}) {
        const [affectedCount] = await model.update(data, { where, ...options });
        if (affectedCount > 0) return await model.findOne({ where, ...options });
        return null;
    }

    static async updateMany(model, where, data, options = {}) {
        return await model.update(data, { where, ...options });
    }

    static async findOneAndUpdate(model, where, data, options = {}) {
        const [affectedCount] = await model.update(data, { where, ...options });
        if (affectedCount > 0) return await model.findOne({ where, ...options });
        if (options.upsert) return await model.create({ ...where, ...data }, options);
        return null;
    }

    static async deleteOne(model, where, options = {}) {
        return await model.destroy({ where, ...options });
    }

    static async deleteMany(model, where, options = {}) {
        return await model.destroy({ where, ...options });
    }

    static async count(model, where = {}, options = {}) {
        return await model.count({ where, ...options });
    }

    static async findOrCreate(model, where, defaults = {}, options = {}) {
        return await model.findOrCreate({ where, defaults: { ...where, ...defaults }, ...options });
    }

    static async paginate(model, where = {}, { page = 1, perPage = 10, order = [["id", "DESC"]], include, attributes } = {}) {
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(perPage, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        const { count, rows } = await model.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order,
            ...(include && { include }),
            ...(attributes && { attributes }),
        });

        return {
            rows,
            meta: {
                total: count,
                perPage: parsedLimit,
                currentPage: parsedPage,
                lastPage: Math.ceil(count / parsedLimit) || 1,
            },
        };
    }
}

export default commonService;
```

### `src/common/authHelper.js` — password + JWT utilities

```javascript
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT } from "./constants/index.js";

class authHelper {
    static async hashPassword(password) {
        return await argon2.hash(password);
    }

    static async matchHashedPassword(plainPassword, hashedPassword) {
        try {
            return await argon2.verify(hashedPassword, plainPassword);
        } catch {
            return false;
        }
    }

    static async tokensGenerator(userId, payloadExtras = {}) {
        const jti = crypto.randomBytes(32).toString("hex");
        const accessToken = jwt.sign(
            { user_id: userId, jti, ...payloadExtras },
            JWT.SECRET,
            { expiresIn: JWT.ACCESS_EXPIRES_IN || "365d" }
        );
        const refreshToken = crypto.randomBytes(100).toString("hex");
        return { accessToken, refreshToken, jti, expiresIn: JWT.ACCESS_EXPIRES_IN || "365d" };
    }

    static async getDataFromToken(token) {
        return jwt.verify(token, JWT.SECRET);
    }

    static generateOtp(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return String(crypto.randomInt(min, max + 1));
    }
}

export default authHelper;
```

### `src/common/helper.js` — cross-cutting helpers

```javascript
import fs from "fs";
import path from "path";

export const baseUrl = (filePath = "") => {
    const base = process.env.APP_URL || `${process.env.BASE_URL}:${process.env.PORT}`;
    if (!filePath) return base;
    return `${base}${filePath.startsWith("/") ? filePath : "/" + filePath}`;
};

export const apiBaseUrl = (filePath = "") => {
    const base = `${process.env.APP_URL || `${process.env.BASE_URL}:${process.env.PORT}`}/api/v1`;
    if (!filePath) return base;
    return `${base}${filePath.startsWith("/") ? filePath : "/" + filePath}`;
};

export const haversineKm = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some((v) => v == null)) return null;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const deleteFileSafe = (absPath) => {
    try { if (absPath && fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch {}
};

export const absolutePathFromUrl = (url) => {
    if (!url) return null;
    const rel = url.startsWith("/") ? url.slice(1) : url;
    return path.join(process.cwd(), rel);
};

export const safeRelativeUrl = (absPath) => {
    const cwd = process.cwd();
    const rel = path.relative(cwd, absPath).replace(/\\/g, "/");
    return `/${rel}`;
};
```

### Auth middleware — `src/common/middleware/auth.js`

```javascript
import authHelper from "../authHelper.js";
import { User, LoginSession } from "../../../models/index.js";
import { HttpStatus } from "../utils/errorException.js";

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false, message: "Authorization token missing", errorCode: "AUTH_TOKEN_MISSING",
            });
        }

        const token = authHeader.split(" ")[1];

        let payload;
        try {
            payload = await authHelper.getDataFromToken(token);
        } catch (err) {
            const message = err.name === "TokenExpiredError"
                ? "Session expired. Please login again."
                : "Invalid token";
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false, message,
                errorCode: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
            });
        }

        const user = await User.findByPk(payload.user_id);
        if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false, message: "User not found", errorCode: "USER_NOT_FOUND",
            });
        }

        if (user.account_status === "banned") {
            return res.status(HttpStatus.FORBIDDEN).json({
                success: false, message: "Account is banned", errorCode: "ACCOUNT_BANNED",
            });
        }

        if (payload.jti) {
            const session = await LoginSession.findOne({ where: { jti: payload.jti, user_id: user.id } });
            if (!session || session.revoked_at) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false, message: "Session expired. Please login again.", errorCode: "SESSION_EXPIRED",
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
```

`req.user` after this middleware has the shape `{ userId, email, role, jti, instance }` — services read `req.user.userId` consistently.

---

## 12. Seeder Pattern

**`seeder/index.js` rules:**
- Always idempotent — check if data exists before inserting
- Called from `dbConnection().then(() => seedDatabase())` in `app.js`
- Seeds: admin/default users, default templates, lookup data (e.g. prompt questions)
- Use `authHelper.hashPassword()` — never store plaintext
- Seeding failure should **not** kill the server (no `process.exit`)

```javascript
import authHelper from "../src/common/authHelper.js";
import { User, PromptQuestion } from "../models/index.js";

const seedDatabase = async () => {
    try {
        const adminEmail = "admin@example.com";
        const exists = await User.findOne({ where: { email: adminEmail } });
        if (!exists) {
            const password_hash = await authHelper.hashPassword("admin123");
            await User.create({
                email: adminEmail,
                password_hash,
                is_verified: true,
                account_status: "active",
                role: "super_admin",
            });
            console.log("Admin seeded.");
        }

        const promptCount = await PromptQuestion.count();
        if (promptCount === 0) {
            await PromptQuestion.bulkCreate([
                { text: "What keeps you consistent?", is_active: true },
                { text: "What is your current goal?", is_active: true },
            ]);
            console.log("Prompt questions seeded.");
        }

        console.log("Database seeding completed.");
    } catch (error) {
        console.error("Seeding error:", error.message);
    }
};

export default seedDatabase;
```

---

## 13. Environment Variables (.env)

**`.env` — all required keys:**

```env
# Application
ENV=local
NODE_ENV=development
APP_NAME=iRoid App
APP_URL=http://localhost:2003
APP_URL_ADMIN=http://localhost:2003

# Server
PORT=2003
BASE_URL=http://localhost
CLIENT_URL=http://localhost:5173

# SSL (only when IS_SECURE=true)
IS_SECURE=false
SSL_CERT_BASE_PATH=

# Auth
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=365d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=iroid_app
DB_DIALECT=mysql

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=

# Firebase
# Dev: leave empty (SDK loads from src/fcm/firebase-adminsdk.json)
# Prod: full JSON string of the Firebase service account
FIREBASE_SERVICE_ACCOUNT=
```

**Production changes:**

```env
ENV=production
NODE_ENV=production
APP_URL=https://api.yourdomain.com
APP_URL_ADMIN=https://admin.yourdomain.com
BASE_URL=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
IS_SECURE=true
SSL_CERT_BASE_PATH=/etc/letsencrypt/live/yourdomain.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

**Rules:**
- Never commit `.env` to git — it must be in `.gitignore`
- `serverChecklist.js` validates all keys are present on startup
- Adding a new env key = add it to BOTH `.env` AND `requiredEnvKeys` in `serverChecklist.js`
- `ENV=production` disables the Swagger UI mount (Section 16)

---

## 14. ES6 Modules, Babel, dotenv Load Order

**This project uses native ESM (`"type": "module"`) with Babel as a transpile fallback.**

### `package.json` required entries

```json
{
    "name": "project-name",
    "type": "module",
    "scripts": {
        "start": "node -r dotenv/config -r @babel/register app.js",
        "dev": "nodemon -r dotenv/config -r @babel/register app.js",
        "seed": "node -r dotenv/config -r @babel/register seeder/index.js"
    }
}
```

### `.babelrc`

```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": { "node": "current" }
            }
        ]
    ]
}
```

### Why `-r dotenv/config`?

ESM hoists all `import` statements to the top, so `dotenv.config()` called at the top of `app.js` runs **after** every `import` has already evaluated. If any imported module reads `process.env.*` at module-load time (like `db.config.js`), it will see `undefined`.

The `-r dotenv/config` preload flag loads the `.env` file **before** Node processes the entry file, guaranteeing env vars are available at every import site.

### ESM rules for every file in the project

- Always use `import` / `export default` / `export const`
- **Every relative import must include the `.js` extension** — `import x from "./foo.js"` (not `"./foo"`)
- `__dirname` is not a global in ESM — reconstruct it:
  ```javascript
  import { fileURLToPath } from "url";
  import path from "path";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```
- Never mix `require()` and `import` in the same file

---

## 15. Production Setup (HTTPS + SSL)

### `.env` for production

```env
ENV=production
NODE_ENV=production
IS_SECURE=true
SSL_CERT_BASE_PATH=/etc/letsencrypt/live/yourdomain.com
APP_URL=https://api.yourdomain.com
```

### Let's Encrypt cert location

`SSL_CERT_BASE_PATH` must point to a folder containing:
- `privkey.pem`
- `cert.pem`
- `fullchain.pem`

`serverChecklist.js` verifies all three exist when `IS_SECURE=true`.

### Process management

Run under `pm2` or systemd:
```bash
pm2 start npm --name "project-name" -- start
pm2 save
pm2 startup
```

### Reverse proxy

If behind nginx, terminate SSL at nginx and set `IS_SECURE=false` in the app's `.env`. If the app terminates SSL directly, set `IS_SECURE=true`.

### Backups

- Daily `mysqldump` cron for the DB
- `uploads/` folder — consider S3 sync post-MVP
- Rotate `JWT_SECRET` only during major deploys (all sessions revoke)

---

## 16. Swagger / OpenAPI Documentation Pattern

**Rule: one single `swagger.yaml` at the project root. Not multiple files. Not JSDoc comments.**

### File location

```
<project-root>/
├── app.js
├── package.json
├── swagger.yaml            ← THE one and only swagger spec
├── models/
├── routes/
├── src/
└── ...
```

### `swagger.yaml` — top-level structure

```yaml
openapi: 3.0.0

info:
    title: <App Name>            # overridden at runtime from APP_NAME
    description: OpenAPI specification for <App>
    version: 1.0.0

components:
    securitySchemes:
        bearerAuth:
            type: http
            scheme: bearer
            bearerFormat: JWT

    responses:
        # Reusable response blocks — each endpoint references these by $ref
        SignupResponse:
            description: Signup successful, OTP sent
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success: { type: boolean, example: true }
                            message: { type: string, example: Signup successful. Please verify your email. }
                            data:
                                type: object
                                properties:
                                    userId: { type: integer, example: 42 }
                                    email: { type: string, example: john.doe@example.com }

        BadRequestError:
            description: Bad request
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success: { type: boolean, example: false }
                            message: { type: string, example: Invalid or expired OTP }
                            errorCode: { type: string, example: OTP_INVALID }

        # ... UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError, etc.

    schemas:
        # Reusable DTOs that responses point to
        User:
            type: object
            properties:
                id: { type: integer, example: 1 }
                email: { type: string, example: john.doe@example.com }
                # ...

paths:
    /auth/signup:
        post:
            summary: Create a new account (emails a 6-digit OTP)
            tags: [Auth]
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required: [email, password]
                            properties:
                                email: { type: string, example: john.doe@example.com }
                                password: { type: string, example: StrongPass@123 }
            responses:
                "201":
                    $ref: "#/components/responses/SignupResponse"
                "409":
                    $ref: "#/components/responses/ConflictError"

    /auth/me:
        get:
            summary: Get the currently authenticated user summary
            tags: [Auth]
            security:
                - bearerAuth: []
            responses:
                "200":
                    $ref: "#/components/responses/MeResponse"
```

### Conventions

- **Reusable response blocks live under `components.responses.*`** — name them by feature + intent (`SignupResponse`, `LoginResponse`, `NotFoundError`, `ConflictError`).
- **Reusable DTOs live under `components.schemas.*`** — reference via `$ref: "#/components/schemas/<Name>"`.
- **Paths point to responses via `$ref`** — never inline the same response shape twice.
- **Public endpoints** omit the `security` block inside the operation.
- **Protected endpoints** include `security: [{ bearerAuth: [] }]` at the operation level.
- **Request body schemas stay inline** in the path — they vary per endpoint. Put realistic `example` values on every field.
- **All response keys use camelCase** — matches what services emit via resource classes.

### Loader — `src/common/config/swagger.js`

```javascript
import "dotenv/config";
import express from "express";
import { serve, setup } from "swagger-ui-express";
import YAML from "yamljs";
const router = express.Router();
const swaggerDoc = YAML.load("swagger.yaml");

if (process.env.ENV !== "production") {
    router.use(
        "/",
        (req, res, next) => {
            swaggerDoc.info.title = process.env.APP_NAME;
            swaggerDoc.servers = [
                {
                    url: `${process.env.APP_URL}/api/v1`,
                    description: "Base url for API's",
                },
            ];
            req.swaggerDoc = swaggerDoc;
            next();
        },
        serve,
        setup(swaggerDoc, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        })
    );
}

export default router;
```

Notes:
- `YAML.load("swagger.yaml")` resolves relative to `process.cwd()` — the project root.
- The middleware mutates `info.title` and `servers` from env at request time so the same YAML works in local, staging, and prod.
- `persistAuthorization: true` keeps the Bearer token across page reloads in the UI.
- Only mounted when `ENV !== "production"` — docs are not exposed in prod.

### Dependencies

```bash
npm install yamljs swagger-ui-express
```

### When adding a new endpoint

1. Build the route/controller/service/resource.
2. Open `swagger.yaml`.
3. If the response shape is new and reusable, add a block under `components.responses`.
4. Add the operation under `paths` with `$ref` to the response.
5. Hit `/api/documentation` — the new route shows up under its tag.

### What NOT to do

- Don't put `@swagger` JSDoc comments in route files.
- Don't split the spec into multiple YAML files under a `swagger/` folder.
- Don't use `swagger-jsdoc` — the spec is hand-written, not generated.
- Don't use `js-yaml` — the convention is `yamljs`.
- Don't inline the same response body twice — pull it into `components.responses` and `$ref` it.

---

## 17. New Project Checklist

When starting a fresh Node.js + Express + Sequelize project, follow this order.

### Phase A — Setup

- [ ] `npm init -y`
- [ ] Add `"type": "module"` to `package.json`
- [ ] Add the three scripts (`start`, `dev`, `seed`) with `-r dotenv/config -r @babel/register`
- [ ] Install runtime deps (see Section 1)
- [ ] Install dev deps (`@babel/core`, `@babel/preset-env`, `@babel/register`, `nodemon`)
- [ ] Create `.babelrc` with `@babel/preset-env` targeting `node: current`
- [ ] Create `.env` with all required keys (Section 13)
- [ ] Add `.env`, `node_modules/`, `uploads/users`, `uploads/progress`, `src/fcm/firebase-adminsdk.json` to `.gitignore`
- [ ] Create `serverChecklist.js` listing every env key (Section 5)

### Phase B — Database

- [ ] Create `src/common/config/db.config.js` with `underscored: true` in `define`
- [ ] Create `models/connection.js` with two-stage sync (alter dev / force:false prod)
- [ ] Create `models/index.js` for imports + associations
- [ ] Define models — default text fields to `DataTypes.TEXT`, attributes in snake_case

### Phase C — Common infrastructure

- [ ] Create `src/common/utils/errorException.js` with the full typed exception family (Section 8)
- [ ] Create `src/common/utils/common.service.js` (Section 11)
- [ ] Create `src/common/authHelper.js` (Section 11)
- [ ] Create `src/common/helper.js` (Section 11)
- [ ] Create `src/common/middleware/errorHandler.js` (Section 8)
- [ ] Create `src/common/middleware/auth.js` (Section 11)
- [ ] Create `src/common/middleware/auditLog.js` (response interceptor)
- [ ] Create `src/common/middleware/roleCheck.js`
- [ ] Create `src/common/middleware/rateLimiter.js` with named limiters (Section 9)
- [ ] Create `src/common/config/joiValidation.js` (`passError: true`)
- [ ] Create `src/common/config/multer.js` for upload storage
- [ ] Create `src/common/constants/enums.js` + `src/common/constants/index.js` (with `JWT` config)

### Phase D — Server Bootstrap

- [ ] Create `app.js` following Section 4 exactly
- [ ] Create `routes/index.js` with request timing + `/health`
- [ ] Create `routes/api.js` with public + protected route groups

### Phase E — Seeder

- [ ] Create `seeder/index.js` — always idempotent, never crashes the server
- [ ] Seed an admin user using `authHelper.hashPassword()`

### Phase F — Feature modules

For each feature:
- [ ] `src/<feature>/<feature>.routes.js` (validator + asyncWrap + rateLimit where needed)
- [ ] `src/<feature>/<feature>.controller.js` (class, static methods, thin wrappers)
- [ ] `src/<feature>/<feature>.service.js` (class, static methods, `(data, req, res)` signature, try/catch + direct `res.json()`)
- [ ] `src/<feature>/dtos/<endpoint>Dtos.js` — one file per endpoint
- [ ] `src/<feature>/resources/get<X>Resources.js` — one file per response shape
- [ ] Throw typed exceptions from services, never return raw errors

### Phase G — Swagger

- [ ] Create SINGLE `swagger.yaml` at the project root
- [ ] Add `components.securitySchemes.bearerAuth`
- [ ] Add `components.responses.*` (reusable response blocks) with realistic examples
- [ ] Add `components.schemas.*` (reusable DTOs)
- [ ] Add `paths:` — every endpoint uses `$ref` to the reusable responses
- [ ] Public endpoints omit `security`; protected endpoints include `security: [{ bearerAuth: [] }]`
- [ ] `src/common/config/swagger.js` uses `yamljs` and only mounts in non-production

### Phase H — Pre-Launch

- [ ] All env keys listed in `serverChecklist.js`
- [ ] SSL cert files exist if `IS_SECURE=true`
- [ ] `uploads/` folder exists and is writable
- [ ] `node_modules` present
- [ ] Test: `npm run dev` — server starts, DB connects, seed runs, no errors
- [ ] Test: `GET /health` returns OK
- [ ] Test: `GET /api/documentation` renders all routes grouped by tag
- [ ] Test: HTTPS works if `IS_SECURE=true`

---

## Quick Reference

| What | Where |
|---|---|
| Entry point | `app.js` |
| DB connection | `models/connection.js` |
| All models | `models/index.js` |
| Feature logic | `src/<feature>/<feature>.service.js` |
| API endpoints | `src/<feature>/<feature>.routes.js` |
| Response shaping | `src/<feature>/resources/get<X>Resources.js` |
| Error handling | `src/common/middleware/errorHandler.js` |
| Exception family | `src/common/utils/errorException.js` |
| Generic DB wrapper | `src/common/utils/common.service.js` |
| Auth helper (argon2 + JWT) | `src/common/authHelper.js` |
| URL / distance helpers | `src/common/helper.js` |
| Auth middleware | `src/common/middleware/auth.js` |
| Rate limiters | `src/common/middleware/rateLimiter.js` |
| Joi validator | `src/common/config/joiValidation.js` |
| Multer config | `src/common/config/multer.js` |
| Env validation | `serverChecklist.js` |
| Default data | `seeder/index.js` |
| Static files | `public/` |
| Uploads | `uploads/` |
| API spec | `swagger.yaml` (single file at project root) |
| Swagger loader | `src/common/config/swagger.js` (uses `yamljs`) |
| API docs | `http://localhost:<PORT>/api/documentation` (non-production only) |
| Default seeded admin | `admin@example.com` / `admin123` |
