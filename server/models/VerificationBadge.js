import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const VerificationBadge = sequelize.define(
    "VerificationBadge",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "inactive",
        },
        last_activity_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_updated: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "verification_badges",
        timestamps: true,
    }
);

export default VerificationBadge;
