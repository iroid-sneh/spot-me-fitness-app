import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const MediaModerationQueue = sequelize.define(
    "MediaModerationQueue",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        media_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        progress_capture_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        source_type: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        flagged_by: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "system",
        },
        ai_score: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",
        },
        reviewer_note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reviewed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "media_moderation_queue",
        timestamps: true,
        indexes: [{ fields: ["status"] }, { fields: ["user_id"] }],
    }
);

export default MediaModerationQueue;
