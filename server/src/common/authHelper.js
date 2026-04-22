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

        return {
            accessToken,
            refreshToken,
            jti,
            expiresIn: JWT.ACCESS_EXPIRES_IN || "365d",
        };
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
