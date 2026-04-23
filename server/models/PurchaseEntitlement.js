import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const PurchaseEntitlement = sequelize.define(
    "PurchaseEntitlement",
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
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        quantity_remaining: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        granted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        source_receipt_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "purchase_entitlements",
        timestamps: true,
        indexes: [{ fields: ["user_id"] }, { fields: ["type"] }],
    }
);

export default PurchaseEntitlement;
