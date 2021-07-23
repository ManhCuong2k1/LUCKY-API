"use strict";

import { Sequelize } from "sequelize";
import config from "../config";

const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = config;

const connection = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    dialect: "mysql",
    dialectOptions: {
        options: {
          requestTimeout: 60000
        }
    },
    timezone: "+07:00", 
    logging: true,
    define: {
        charset: "utf8",
        collate: "utf8_general_ci",
    }
});

export default connection;
