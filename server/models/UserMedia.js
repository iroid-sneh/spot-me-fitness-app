import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const UserMedia = sequelize.define(
    "UserMedia",
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
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        duration_sec: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        is_fitness: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_main_photo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        source: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "camera_roll",
        },
        mime_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        size_bytes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        has_face: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        moderation_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",
        },
        moderation_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ai_score: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "user_media",
        timestamps: true,
        paranoid: true,
        indexes: [{ fields: ["user_id", "order_index"] }],
    }
);

export default UserMedia;
