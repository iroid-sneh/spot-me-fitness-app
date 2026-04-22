import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const FaceVerificationLog = sequelize.define(
    "FaceVerificationLog",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        attempt_image_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        matched_against_media_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        result: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        confidence: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: true,
        },
        attempt_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        provider: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "face_verification_logs",
        timestamps: true,
        indexes: [{ fields: ["user_id"] }],
    }
);

export default FaceVerificationLog;
