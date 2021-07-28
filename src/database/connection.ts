"use strict";

import { Sequelize } from "sequelize";
import config from "../config";

const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = config;

const connection = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    dialect: "mysql",
    dialectOptions: {
        useUTC: false, // không chuyển đổi thời gian sang UTC khi đọc dữ liệu từ database
        dateStrings: true,
        options: {
            requestTimeout: 60000,
        },
        typeCast: function (field: any, next: any) { // for reading from database
            if (field.type === "DATETIME") {
                const timeDB = new Date(field.string());
                timeDB.setTime( timeDB.getTime() + 7 * 60 * 60 * 1000 );
                return timeDB;
            }
            return next();
        },
    },
    timezone: "+07:00",
    logging: true,
    define: {
        charset: "utf8",
        collate: "utf8_general_ci",
    }
});

export default connection;
