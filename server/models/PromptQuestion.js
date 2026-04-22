import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const PromptQuestion = sequelize.define(
    "PromptQuestion",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "prompt_questions",
        timestamps: true,
    }
);

export default PromptQuestion;
