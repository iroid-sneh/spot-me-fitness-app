import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Lifestyle = sequelize.define(
    "Lifestyle",
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
        smoking: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        drinking: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        kids: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        language: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        looking_for: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "lifestyles",
        timestamps: true,
    }
);

export default Lifestyle;
