require("module-alias/register");
import errorHandler from "errorhandler";

import app from "./app";
import socket from "socket.io";
import config from "./config";
import { redisClient } from "@database/redis";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(config.PORT, () => {
    console.log(
        " App is running at http://localhost:%d in %s mode",
        config.PORT,
        config.ENV
    );
    console.log("  Press CTRL-C to stop\n");
});


export default server;
