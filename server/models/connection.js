import dbConfig from "../src/common/config/db.config.js";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define,
});

export const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL Database connected successfully.");

        if (process.env.NODE_ENV === "development") {
            try {
                await sequelize.sync({ alter: { drop: false } });
            } catch {
                console.warn("alter sync failed — falling back to create-only sync.");
                await sequelize.sync({ force: false });
            }
        } else {
            await sequelize.sync({ force: false });
        }

        console.log("All models synced.");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default sequelize;
