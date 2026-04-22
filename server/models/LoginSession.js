import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const LoginSession = sequelize.define(
    "LoginSession",
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
        device_id: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        jti: {
            type: DataTypes.STRING(128),
            allowNull: true,
            unique: true,
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        last_seen_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "login_sessions",
        timestamps: true,
        indexes: [{ fields: ["user_id"] }],
    }
);

export default LoginSession;
