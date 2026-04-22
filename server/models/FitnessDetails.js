import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const FitnessDetails = sequelize.define(
    "FitnessDetails",
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
        workout_types: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        workout_frequency: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        fitness_goals: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        training_styles: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        diet_style: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        intent: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        style_preference: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "no_preference",
        },
    },
    {
        tableName: "fitness_details",
        timestamps: true,
    }
);

export default FitnessDetails;
