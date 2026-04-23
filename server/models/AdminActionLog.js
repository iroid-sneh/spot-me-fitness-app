import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const AdminActionLog = sequelize.define(
    "AdminActionLog",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        admin_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        action_type: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        target_type: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        target_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        payload: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "admin_action_logs",
        timestamps: true,
        indexes: [{ fields: ["admin_user_id"] }, { fields: ["action_type"] }],
    }
);

export default AdminActionLog;
