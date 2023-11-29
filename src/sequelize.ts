// sequelize.ts

import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize/types";

const developmentConfigsSqlite: any = {
  dialect: "sqlite",
  storage: '../../.temp/sqlite/database.sqlite',
  logging: false,
  models: [__dirname + "/models"],
};

const configs = {
  database: process.env.DB_NAME || "your_database_name",
  username: process.env.DB_USER || "your_database_user",
  password: process.env.DB_PASSWORD || "your_database_password",
  host: process.env.DB_HOST || "localhost",
  dialect: (process.env.DB_DIALECT as Dialect) || "mysql",
  logging: false,
  models: [__dirname + "/models"],
};

export const sequelize = new Sequelize(
  process.env.DB_DIALECT === "sqlite" ? developmentConfigsSqlite : configs
);
