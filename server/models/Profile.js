import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Profile = sequelize.define(
    "Profile",
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
        full_name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        height_cm: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        distance_pref_km: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 50,
        },
        main_profile_photo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        profile_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",
        },
        activated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "profiles",
        timestamps: true,
        paranoid: true,
    }
);

export default Profile;
