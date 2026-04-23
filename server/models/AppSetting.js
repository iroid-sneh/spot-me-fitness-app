import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const AppSetting = sequelize.define(
    "AppSetting",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        setting_key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "app_settings",
        timestamps: true,
    }
);

export default AppSetting;
