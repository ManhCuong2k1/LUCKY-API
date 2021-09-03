"use strict";

import assert from "assert";
import dotenv from "dotenv";
dotenv.config();

const {
    ENV,
    PORT,
    HOST,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    SESSION_SECRET,
    JWT_KEY,
    JWT_EXPIRES_IN,
} = process.env;

assert( PORT, "PORT configuration is required." );
assert( DB_HOST, "DB_HOST configuration is required." );
assert( DB_NAME, "DB_NAME configuration is required." );
assert( DB_USERNAME, "DB_USERNAME configuration is required." );
assert( DB_PASSWORD, "DB_PASSWORD configuration is required." );
assert( DB_PORT, "DB_PORT configuration is required." );
assert( SESSION_SECRET, "SESSION_SECRET configuration is required." );
assert( JWT_KEY, "JWT_KEY configuration is required." );

export default {
    ENV,
    PORT,
    HOST,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    SESSION_SECRET,
    JWT_KEY,
    JWT_EXPIRES_IN,
};
