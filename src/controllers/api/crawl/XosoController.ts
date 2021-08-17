import path from "path";
import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import helper from "@controllers/api/helper/helper";
import updateTicket from "../app/lottery/updateresult";
import { LotteryResultsInterface, LotteryResultsModel } from "@models/LotteryResults";
import moment from "moment-timezone";

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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.KENO, crawling.data);
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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.POWER, crawling.data);
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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MEGA, crawling.data);
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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3D, crawling.data);
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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3DPLUS, crawling.data);
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
                const updateData = updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX4D, crawling.data);
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
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "mienbac":
            try {
                const crawling = await Crawl.XosoMienBac();
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "6x36":
            try {
                const crawling = await Crawl.Xoso6x36();
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "dientoan123":
            try {
                const crawling = await Crawl.DienToan123();
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;

        case "ketqualoto":
            try {
                const crawling = await Crawl.LotoCrawl();
                return res.send(crawling);
            } catch (e) {
                res.status(401).send({
                    code: e.message
                });
            }
            break;


        default:
            res.status(403).send("403");
            break;
    }
});




/* eslint-disable no-alert, no-console */
router.get("/get-round/:type", async (req: express.Request, res: Response) => {

    try {

        switch (req.params.type) {
            case "keno":
                const getKenoRoud: any = await Crawl.getKenoCurrentRound();

                const toDateString = new Date(getKenoRoud.data.finish_time);
                const momentTime = moment(toDateString).tz("Asia/Ho_Chi_Minh").format("X");

                const datExport: any = {
                    status: true,
                    data: {
                        current_round: getKenoRoud.data.current_round, // eslint-disable-line
                        finish_time: Number(momentTime) * 1000 // eslint-disable-line
                    },
                    message: "success"
                };

                res.send(datExport);
                break;

            case "power":
                const lastRecord = await LotteryResultsModel.findOne({
                    where: {
                        type: LotteryResultsModel.GAME_ENUM.POWER
                    },
                    order: [["id", "DESC"]],
                });

                if (lastRecord !== null) {
                    let currentTimeRound: any = helper.addMinuteToTime(helper.getTimeData(lastRecord.next.toString()), 0);

                    const dataExport: any = [];
                    let currentRound = Number(lastRecord.round) + 1;
                    let isFist = true;

                    for (let i = 1; i <= 10; i++) {
                        if (!isFist) {
                            currentRound++;
                            currentTimeRound = helper.addMinuteToTime(currentTimeRound, 2880); // + 2 ngày

                            const thisTime: any = new Date(currentTimeRound).getDay() + 1;
                            if (thisTime == 3 || thisTime == 5 || thisTime == 7) {
                            } else {
                                currentTimeRound = helper.addMinuteToTime(currentTimeRound, 1440); // + 1 ngày
                            }
                        }

                        dataExport.push({
                            round: "00" + currentRound,
                            time: new Date(currentTimeRound).getTime()
                        });

                        isFist = false;
                    }


                    res.json({
                        status: true,
                        data: dataExport,
                        jackpot: await Crawl.XosoGetJackPot("power")
                    });

                } else {
                    res.json({
                        status: false,
                        message: "Error: not find last record"
                    });
                }

                break;


            case "mega":
                const lastRecordMega = await LotteryResultsModel.findOne({
                    where: {
                        type: LotteryResultsModel.GAME_ENUM.MEGA
                    },
                    order: [["id", "DESC"]],
                });

                if (lastRecordMega !== null) {
                    let currentTimeRound: any = helper.addMinuteToTime(helper.getTimeData(lastRecordMega.next.toString()), 0);

                    const dataExport: any = [];
                    let currentRound = Number(lastRecordMega.round) + 1;
                    let isFist = true;

                    for (let i = 1; i <= 10; i++) {
                        if (!isFist) {
                            currentRound++;
                            currentTimeRound = helper.addMinuteToTime(currentTimeRound, 2880); // + 2 ngày
                            const thisTime: any = new Date(currentTimeRound).getDay() + 1;
                            if (thisTime == 4 || thisTime == 6 || thisTime == 1) {
                            } else {
                                currentTimeRound = helper.addMinuteToTime(currentTimeRound, 1440); // + 1 ngày
                            }
                        }

                        dataExport.push({
                            round: "00" + currentRound,
                            time: new Date(currentTimeRound).getTime()
                        });

                        isFist = false;
                    }


                    res.json({
                        status: true,
                        data: dataExport,
                        jackpot: await Crawl.XosoGetJackPot("mega")
                    });

                } else {
                    res.json({
                        status: false,
                        message: "Error: not find last record"
                    });
                }

                break;

            case "max3d":
                const lastRecordMax3d = await LotteryResultsModel.findOne({
                    where: {
                        type: LotteryResultsModel.GAME_ENUM.MAX3D
                    },
                    order: [["id", "DESC"]],
                });

                if (lastRecordMax3d !== null) {
                    let currentTimeRound: any = helper.addMinuteToTime(helper.getTimeData(lastRecordMax3d.next.toString()), 0);

                    const dataExport: any = [];
                    let currentRound = Number(lastRecordMax3d.round) + 1;
                    let isFist = true;

                    for (let i = 1; i <= 10; i++) {
                        if (!isFist) {
                            currentRound++;
                            currentTimeRound = helper.addMinuteToTime(currentTimeRound, 2880); // + 2 ngày
                            const thisTime: any = new Date(currentTimeRound).getDay() + 1;
                            if (thisTime == 2 || thisTime == 4 || thisTime == 6) {
                            } else {
                                currentTimeRound = helper.addMinuteToTime(currentTimeRound, 1440); // + 1 ngày
                            }
                        }

                        dataExport.push({
                            round: "00" + currentRound,
                            time: new Date(currentTimeRound).getTime()
                        });

                        isFist = false;
                    }


                    res.json({
                        status: true,
                        data: dataExport
                    });

                } else {
                    res.json({
                        status: false,
                        message: "Error: not find last record"
                    });
                }

                break;

            case "max4d":
                const lastRecordMax4d = await LotteryResultsModel.findOne({
                    where: {
                        type: LotteryResultsModel.GAME_ENUM.MAX4D
                    },
                    order: [["id", "DESC"]],
                });

                if (lastRecordMax4d !== null) {
                    let currentTimeRound: any = helper.addMinuteToTime(helper.getTimeData(lastRecordMax4d.next.toString()), 0);

                    const dataExport: any = [];
                    let currentRound = Number(lastRecordMax4d.round) + 1;
                    let isFist = true;

                    for (let i = 1; i <= 10; i++) {
                        if (!isFist) {
                            currentRound++;
                            currentTimeRound = helper.addMinuteToTime(currentTimeRound, 2880); // + 2 ngày
                            const thisTime: any = new Date(currentTimeRound).getDay() + 1;
                            if (thisTime == 3 || thisTime == 5 || thisTime == 7) {
                            } else {
                                currentTimeRound = helper.addMinuteToTime(currentTimeRound, 1440); // + 1 ngày
                            }
                        }

                        dataExport.push({
                            round: "00" + currentRound,
                            time: new Date(currentTimeRound).getTime()
                        });

                        isFist = false;
                    }


                    res.json({
                        status: true,
                        data: dataExport
                    });

                } else {
                    res.json({
                        status: false,
                        message: "Error: not find last record"
                    });
                }

                break;

            case "kienthiet":
                const currentTimekienthiet = moment().format("YYYY-MM-DD");
                const tomorowTimekienthiet: any = moment(currentTimekienthiet + " 18:30").add(1, "d").tz("Asia/Ho_Chi_Minh").format("X");
                const roundIdkienthiet = moment(moment(currentTimekienthiet).add(1, "d").tz("Asia/Ho_Chi_Minh")).tz("Asia/Ho_Chi_Minh").format("YYYYMMDD");

                const datExportKienThiet: any = {
                    status: true,
                    data: {
                        current_round: roundIdkienthiet, // eslint-disable-line
                        finish_time: tomorowTimekienthiet * 1000 // eslint-disable-line
                    },
                    message: "success"
                };
                res.send(datExportKienThiet);
            break;

            case "compute636":
                let currentTimecompute636:any = moment().tz("Asia/Ho_Chi_Minh");
                console.log(currentTimecompute636);
                const nowHourTimecompute636:any = moment().format("H");
                let nextTimecompute636;
                console.log(currentTimecompute636.day());
                //nowHourTimecompute636


                if(currentTimecompute636.day() == 4 || currentTimecompute636.day() == 7) {

                }else {
                    for(var loopTimecompute636 = 1; loopTimecompute636 <= 5 ;loopTimecompute636++) {
                        nextTimecompute636 = moment(currentTimecompute636).day();
                        if(nextTimecompute636 == 4 || nextTimecompute636 == 7) {
                            console.log("next day id "+ nextTimecompute636);
                            break;
                        }else {
                            currentTimecompute636 = moment(currentTimecompute636).add(1, "d");
                        }
                    }                    
                }




            break;
            case "compute123":
            break;
            case "loto2":
            break;
            case "loto3":
            break;
            case "loto5":
            break;
            case "loto234":
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