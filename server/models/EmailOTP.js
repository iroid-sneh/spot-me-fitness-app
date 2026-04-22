import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const EmailOTP = sequelize.define(
    "EmailOTP",
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
        otp_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        consumed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "email_otps",
        timestamps: true,
        indexes: [
            { fields: ["user_id", "type"] },
        ],
    }
);

export default EmailOTP;
