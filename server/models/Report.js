import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Report = sequelize.define(
    "Report",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reporter_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        reported_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason_category: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        related_media_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        related_progress_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "open",
        },
        admin_note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "reports",
        timestamps: true,
        indexes: [{ fields: ["reported_user_id"] }, { fields: ["status"] }],
    }
);

export default Report;
