import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import updateTicket from "../app/lottery/updateresult";
import updateLoto from "../app/lottery/updateresultloto";
import { LotteryResultsModel } from "@models/LotteryResults";
import moment from "moment-timezone";
import helper from "../helper/helper";
import { LotteryPeriodsModel } from "@models/LotteryPeriod";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.status(403).send("403");
});


/**
 * @openapi
 * /xoso/sync/:type:
 *   get:
 *     tags:
 *      - "[API] Xoso"
 *     summary: Lấy thông tin phiên xổ số  mới nhất theo loai
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/sync/:type", async (req: Request, res: Response) => {
    switch (req.params.type) {
        case "keno":
            try {
                const crawling = await Crawl.XosoKenoData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.KENO, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;
        case "power":
            try {
                const crawling = await Crawl.XosoPowerData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.POWER, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;
        case "mega":
            try {
                const crawling = await Crawl.XosoMegaData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MEGA, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;
        case "max3d":
            try {
                const crawling = await Crawl.XosoMax3dData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3D, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "max3dplus":
            try {
                const crawling = await Crawl.XosoMax3dData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3DPLUS, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "max4d":
            try {
                const crawling = await Crawl.XosoMax4dData();
                await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX4D, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "xsmb":
            try {
                const crawling = await Crawl.XosoMienBac();
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.KIENTHIET, crawling.data);
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "compute":
            try {
                const DienToan123 = await Crawl.DienToan123();
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.COMPUTE123, DienToan123.data);
                const Xoso6x36 = await Crawl.Xoso6x36();
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.COMPUTE636, Xoso6x36.data);
                return res.json({
                    status: true,
                    data: {
                        dientoan636: Xoso6x36.data,
                        dientoan123: DienToan123.data
                    }
                });
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "loto":
            try {
                const crawling = await Crawl.XosoMienBac();
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO2, crawling.data);
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO3, crawling.data);
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO5, crawling.data);

                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "loto235":
            try {
                const lotoResult = await Crawl.LotoCrawl();
                await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO234, lotoResult.data);
                return res.send(lotoResult);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;


        default:
            res.status(404).send({
                code: "404"
            });
            break;
    }
});




/* eslint-disable no-alert, no-console */
router.get("/get-round/:type", async (req: express.Request, res: Response) => {

    try {

        switch (req.params.type) {
            case "keno":
                /* eslint-disable */
                const nextRoundTime = helper.roundingTime().format("x");

                const KenoRoundDB = await LotteryPeriodsModel.findOne({
                    where: {
                        time: nextRoundTime
                    }
                });

                if(KenoRoundDB !== null) {
                    res.json({
                        status: true,
                        data: {
                            current_round: KenoRoundDB.roundId,
                            finish_time: Number(KenoRoundDB.time)
                        }
                    });   
                }else {
                    res.json({
                        status: true,
                        data: {
                            current_round: "00undefined",
                            finish_time: Number(moment().format("x"))
                        }
                    });
                }
                /* eslint-enable */
                break;

            case "power":
                res.json(await Crawl.getPowerRound());
                break;


            case "mega":
                res.json(await Crawl.getMegaRound());
                break;

            case "max3d":
                res.json(await Crawl.getMax3DRound());
                break;

            case "max4d":
                res.json(await Crawl.getMax4DRound());
                break;

            case "kienthiet":
                const nowtime: any = moment();
                const currentTimekienthiet = moment();
                currentTimekienthiet.set("hour", 18);
                currentTimekienthiet.set("minute", 30);
                let tomorowTimekienthiet: any;

                if (nowtime.format("H") >= 18) {
                    tomorowTimekienthiet = moment(currentTimekienthiet);
                    tomorowTimekienthiet.set("hour", 18);
                    tomorowTimekienthiet.set("minute", 30);
                    tomorowTimekienthiet.set("second", 0);
                    tomorowTimekienthiet.set("millisecond", 0);
                    tomorowTimekienthiet.add(1, "d");
                } else {
                    tomorowTimekienthiet = moment(nowtime);
                    tomorowTimekienthiet.set("hour", 18);
                    tomorowTimekienthiet.set("minute", 30);
                    tomorowTimekienthiet.set("second", 0);
                    tomorowTimekienthiet.set("millisecond", 0);
                    tomorowTimekienthiet = tomorowTimekienthiet;
                }

                const roundIdkienthiet = moment(tomorowTimekienthiet).format("YYYYMMDD");

                const dataExportKienThiet: any = {
                    status: true,
                    data: {
                        current_round: roundIdkienthiet, // eslint-disable-line
                        finish_time: Number(moment(tomorowTimekienthiet).format("X")) * 1000 // eslint-disable-line
                    },
                    message: "success"
                };
                res.send(dataExportKienThiet);
                break;

            case "compute636":
                const currentTimecompute636: any = moment();
                let checkTimecomputer636: any = moment();
                let runTimecomputer636: any = moment();
                let nextTimecompute636: any;

                if (currentTimecompute636.format("dddd") == "Wednesday" || currentTimecompute636.format("dddd") == "Saturday") {
                    if (currentTimecompute636.format("H") >= 18) {
                        runTimecomputer636.add(1, "d");
                        for (let loopTimecompute636 = 1; loopTimecompute636 <= 10; loopTimecompute636++) {
                            checkTimecomputer636 = moment(runTimecomputer636).format("dddd");
                            if (checkTimecomputer636 == "Wednesday" || checkTimecomputer636 == "Saturday") {
                                nextTimecompute636 = runTimecomputer636.format("YYYY-MM-DD");
                                break;
                            } else {
                                runTimecomputer636 = moment(runTimecomputer636).add(1, "d");
                            }
                        }
                    } else {
                        runTimecomputer636.set("hour", 18);
                        runTimecomputer636.set("minute", 15);
                        runTimecomputer636.set("second", 0);
                        runTimecomputer636.set("millisecond", 0);
                        nextTimecompute636 = moment(runTimecomputer636);
                    }
                } else {
                    for (let loopTimecompute636 = 1; loopTimecompute636 <= 10; loopTimecompute636++) {
                        checkTimecomputer636 = moment(runTimecomputer636).format("dddd");
                        if (checkTimecomputer636 == "Wednesday" || checkTimecomputer636 == "Saturday") {
                            nextTimecompute636 = runTimecomputer636.format("YYYY-MM-DD");
                            break;
                        } else {
                            runTimecomputer636 = moment(runTimecomputer636).add(1, "d");
                        }
                    }
                }

                let timeSet: any = moment(nextTimecompute636);
                timeSet.set("hour", 18);
                timeSet.set("minute", 15);
                timeSet.set("second", 0);
                timeSet.set("millisecond", 0);

                timeSet = moment(timeSet).format("X");

                const roundIdcompute636 = moment(Number(timeSet) * 1000).format("YYYYMMDD");

                res.json({
                    status: true,
                    data: {
                        current_round: roundIdcompute636, // eslint-disable-line
                        finish_time: timeSet * 1000 // eslint-disable-line
                    },
                    message: "success"
                });

                break;

            case "compute123":
                const nowtimecompute123: any = moment();
                const currentTimecompute123 = moment();
                currentTimecompute123.set("hour", 18);
                currentTimecompute123.set("minute", 30);
                let tomorowTimecompute123: any;

                if (nowtimecompute123.format("H") >= 18) {
                    tomorowTimecompute123 = moment(currentTimecompute123);
                    tomorowTimecompute123.set("hour", 18);
                    tomorowTimecompute123.set("minute", 30);
                    tomorowTimecompute123.set("second", 0);
                    tomorowTimecompute123.set("millisecond", 0);
                    tomorowTimecompute123.add(1, "d");
                } else {
                    tomorowTimecompute123 = moment(currentTimecompute123);
                    tomorowTimecompute123.set("hour", 18);
                    tomorowTimecompute123.set("minute", 30);
                    tomorowTimecompute123.set("second", 0);
                    tomorowTimecompute123.set("millisecond", 0);
                    tomorowTimecompute123 = tomorowTimecompute123;
                }

                const roundIdcompute123 = moment(tomorowTimecompute123).format("YYYYMMDD");

                res.json({
                    status: true,
                    data: {
                        current_round: roundIdcompute123, // eslint-disable-line
                        finish_time: Number(moment(tomorowTimecompute123).format("X")) * 1000 // eslint-disable-line
                    },
                    message: "success"
                });
                break;

            default:
                res.json({ status: false, message: "Error: error params!" });
                break;

        }
    } catch (err) {
        res.json({
            status: false,
            message: err.message
        });
    }


});
/* eslint-enable no-alert, no-console */




router.get("/results/:type", async (req: Request, res: Response) => {
    try {

        if (typeof req.query.round !== "undefined") {
            const resultsData = await LotteryResultsModel.findOne({
                where: {
                    round: req.query.round,
                    type: req.params.type
                }
            });
            const dataExport: any = {};
            dataExport["data"] = [];
            const dataPush = {
                id: resultsData.id,
                type: resultsData.type,
                date: resultsData.date,
                next: resultsData.next,
                round: resultsData.round,
                result: JSON.parse(resultsData.result),
                createdAt: resultsData.createdAt,
                updatedAt: resultsData.updatedAt
            };
            dataExport["data"].push(dataPush);

            res.json(dataExport);

        } else {
            const resultsData = await LotteryResultsModel.findAll({
                where: {
                    type: req.params.type
                }, order: [["id", "DESC"]]
            });

            const dataExport: any = {};
            dataExport["data"] = [];

            if (resultsData.length > 0) {
                resultsData.forEach((resultsData: any) => {
                    const dataPush = {
                        id: resultsData.id,
                        type: resultsData.type,
                        date: resultsData.date,
                        next: resultsData.next,
                        round: resultsData.round,
                        result: JSON.parse(resultsData.result),
                        createdAt: resultsData.createdAt,
                        updatedAt: resultsData.updatedAt
                    };
                    dataExport["data"].push(dataPush);
                });
                res.json(dataExport);
            } else {
                res.json({
                    status: false,
                    message: "Chưa có kết quả nào"
                });
            }
        }
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
});




router.get("/guild/:type", (req, res) => {
    try {
        res.sendFile(process.cwd() + "/public/views/guild/" + req.params.type + ".html");
    } catch (error) {
        res.send("ERROR");
    }
});

router.get("/terms", (req, res) => {
    try {
        res.sendFile(process.cwd() + "/public/views/terms/terms.html");
    } catch (error) {
        res.send("ERROR");
    }
});

router.get("/banks", (req, res) => {
    try {
        res.sendFile(process.cwd() + "/public/views/bank/banks.html");
    } catch (error) {
        res.send("ERROR");
    }
});


export default router;