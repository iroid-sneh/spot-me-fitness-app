import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Subscription = sequelize.define(
    "Subscription",
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
        platform: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        plan: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "active",
        },
        started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        latest_receipt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "subscriptions",
        timestamps: true,
        indexes: [{ fields: ["user_id"] }, { fields: ["status"] }],
    }
);

export default Subscription;
