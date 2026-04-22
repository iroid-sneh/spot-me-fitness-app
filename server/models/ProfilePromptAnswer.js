import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const ProfilePromptAnswer = sequelize.define(
    "ProfilePromptAnswer",
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
        prompt_question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        answer_text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        likes_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "profile_prompt_answers",
        timestamps: true,
        paranoid: true,
        indexes: [{ fields: ["user_id"] }],
    }
);

export default ProfilePromptAnswer;
