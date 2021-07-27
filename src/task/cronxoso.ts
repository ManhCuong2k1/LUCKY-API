import schedule from "node-schedule";
import cron from "node-cron";
import Crawl from "@controllers/api/crawl/Crawl";
import updateTicket from "@controllers/api/app/lottery/updateresult";
import { LotteryInterface, LotteryModel } from "@models/Lottery";

const createTask = () => {


    cron.schedule("*/1 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.KENO, crawling.data);
            console.log("runing.....");
        } catch (e) {
            console.log("Schedule Keno: " + e.message);
        }
        console.log("runing.....");
    });


    cron.schedule("*/2 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.POWER, crawling.data);
        } catch (e) {
            console.log("Schedule POWER: " + e.message);
        }
    });

    cron.schedule("*/2 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.MEGA, crawling.data);
        } catch (e) {
            console.log("Schedule MEGA: " + e.message);
        }
    });

    cron.schedule("*/2 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.MAX3D, crawling.data);
        } catch (e) {
            console.log("Schedule MAX3D: " + e.message);
        }
    });

    cron.schedule("*/2 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.MAX3DPLUS, crawling.data);
        } catch (e) {
            console.log("Schedule MAX3DPLUS: " + e.message);
        }
    });

    cron.schedule("*/2 * * * *", async () => {
        try {
            const crawling = await Crawl.XosoKenoData();
            updateTicket.updateResult(LotteryModel.GAME_ENUM.MAX4D, crawling.data);
        } catch (e) {
            console.log("Schedule MAX4D: " + e.message);
        }
    });

    return "task running...";
};


export default {
    createTask
};