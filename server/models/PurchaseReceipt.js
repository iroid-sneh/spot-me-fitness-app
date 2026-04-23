import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const PurchaseReceipt = sequelize.define(
    "PurchaseReceipt",
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
        product_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        transaction_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        purchase_type: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "one_time",
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "USD",
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        raw_payload: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "purchase_receipts",
        timestamps: true,
        indexes: [{ fields: ["user_id"] }, { fields: ["verified"] }],
    }
);

export default PurchaseReceipt;
