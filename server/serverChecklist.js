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
        "ENV",
        "BASE_URL",
        "CLIENT_URL",
        "IS_SECURE",
        "APP_URL_ADMIN",
        "APP_URL",
        "APP_NAME",
        "PORT",
        "SSL_CERT_BASE_PATH",
        "JWT_SECRET",
        "JWT_EXPIRES_IN",
        "NODE_ENV",
        "DB_HOST",
        "DB_PORT",
        "DB_USER",
        "DB_PASS",
        "DB_NAME",
        "DB_DIALECT",
        "MAIL_HOST",
        "MAIL_PORT",
        "MAIL_USER",
        "MAIL_PASS",
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
        if (!presentKeys.includes(key)) {
            checklist.push(`ENV key missing: ${key}`);
        }
    });

    presentKeys.forEach((key) => {
        if (!requiredEnvKeys.includes(key)) {
            checklist.push(`Extra ENV key found (not in required list): ${key}`);
        }
    });

    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
        try {
            fs.mkdirSync(uploadPath, { recursive: true });
        } catch (err) {
            checklist.push(`Failed to create uploads folder: ${err.message}`);
        }
    }

    const userUploads = path.join(uploadPath, "users");
    const progressUploads = path.join(uploadPath, "progress");
    [userUploads, progressUploads].forEach((p) => {
        if (!fs.existsSync(p)) {
            try {
                fs.mkdirSync(p, { recursive: true });
            } catch (err) {
                checklist.push(`Failed to create ${p}: ${err.message}`);
            }
        }
    });

    if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
        checklist.push("node_modules not found. Run `npm install`.");
    }

    const pkgPath = path.join(__dirname, "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (!pkg.scripts?.start) {
            checklist.push("Missing start script in package.json.");
        }
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
