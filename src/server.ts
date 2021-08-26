require("module-alias/register");
import errorHandler from "errorhandler";
import app from "./app";
import cron from "node-cron";
import config from "./config";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
import { 
    TaskKeno,
    TaskMegaPowerMax3dMax4d,
    TaskCompute,
    TaskXsmb
} from "./task/xoso";

/****

if (config.ENV === "production") {
    cron.schedule("0 * * * * *", async () => {
        try {
            await TaskKeno();
            console.log("Task Done: KENO at " + moment().format("DD-MM-YYYY HH:mm:ss"));
        } catch (error) {
            console.log(error.message);
        }
    });
    cron.schedule("00 59 * * * *", async () => {
        try {
            await TaskXsmb();
            console.log("Task Done: XSMB at " + moment().format("DD-MM-YYYY HH:mm:ss"));
            await TaskCompute();
            console.log("Task Done: COMPUTE123 - COMPUTER6x36 at " + moment().format("DD-MM-YYYY HH:mm:ss"));
            await TaskMegaPowerMax3dMax4d();
            console.log("Task Done: MEGA - POWER - MAX3D - MAX3D PLUS - MAX4D at " + moment().format("DD-MM-YYYY HH:mm:ss"));
        } catch (error) {
            console.log(error.message);
        }
    });
}
 */

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
