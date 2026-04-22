import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const ProgressCapture = sequelize.define(
    "ProgressCapture",
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
        media_url: {
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
        captured_month: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        captured_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        workout_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        caption: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        source: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        is_raw_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        mime_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        size_bytes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "progress_captures",
        timestamps: true,
        paranoid: true,
        indexes: [{ fields: ["user_id"] }, { fields: ["created_at"] }],
    }
);

export default ProgressCapture;
