import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(191),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password_hash: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_forgot_password_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        face_verified_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",
        },
        account_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "user",
        },
        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        paranoid: true,
    }
);

export default User;
