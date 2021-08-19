import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import helper from "@controllers/api/helper/helper";
import updateTicket from "../app/lottery/updateresult";
import updateLoto from "../app/lottery/updateresultloto";
import { LotteryResultsModel } from "@models/LotteryResults";
import moment from "moment-timezone";
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

        case "mienbac":
            try {
                const crawling = await Crawl.XosoMienBac();
                const updateData = updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.KIENTHIET, crawling.data);
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
                const updateData = updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.COMPUTE636, crawling.data);
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
                const momentTime = moment(getKenoRoud.data.finish_time).format("X");

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
                const nowtime: any = moment().tz("Asia/Ho_Chi_Minh");
                const currentTimekienthiet = moment().format("YYYY-MM-DD");
                let tomorowTimekienthiet: any;


                if(nowtime.format("H") >= 18) {
                    tomorowTimekienthiet = moment(currentTimekienthiet + " 18:30").add(1, "d").tz("Asia/Ho_Chi_Minh").format("X");
                }else {
                    tomorowTimekienthiet = moment(new Date(moment(nowtime).format("YYYY/MM/DD") + " 18:30")).tz("Asia/Ho_Chi_Minh").format("X");
                }

                const roundIdkienthiet =  moment(Number(tomorowTimekienthiet) * 1000).format("YYYYMMDD");

                const dataExportKienThiet: any = {
                    status: true,
                    data: {
                        current_round: roundIdkienthiet, // eslint-disable-line
                        finish_time: tomorowTimekienthiet * 1000 // eslint-disable-line
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

                if(currentTimecompute636.format("dddd") == "Wednesday" || currentTimecompute636.format("dddd") == "Saturday") {
                    if(currentTimecompute636.format("H") >= 18) {
                        for(let loopTimecompute636 = 1; loopTimecompute636 <= 10 ;loopTimecompute636++) {
                            checkTimecomputer636 = moment(runTimecomputer636).format("dddd");
                            if(checkTimecomputer636 == "Wednesday" || checkTimecomputer636 == "Saturday") {
                                nextTimecompute636 = moment(new Date(moment(runTimecomputer636).format("YYYY/MM/DD") + " 18:00")).tz("Asia/Ho_Chi_Minh").format("X");
                                break;
                            }else {
                                runTimecomputer636 = moment(runTimecomputer636).add(1, "d");
                            }
                        } 
                    }else {
                        nextTimecompute636 = moment(new Date(moment().format("YYYY/MM/DD") + " 18:00")).tz("Asia/Ho_Chi_Minh").format("X");
                    }
                }else {
                    for(let loopTimecompute636 = 1; loopTimecompute636 <= 10 ;loopTimecompute636++) {
                        checkTimecomputer636 = moment(runTimecomputer636).format("dddd");
                        
                        if(checkTimecomputer636 == "Wednesday" || checkTimecomputer636 == "Saturday") {
                            nextTimecompute636 = moment(new Date(moment(runTimecomputer636).format("YYYY/MM/DD") + " 18:00")).tz("Asia/Ho_Chi_Minh").format("X");
                            break;
                        }else {
                            runTimecomputer636 = moment(runTimecomputer636).add(1, "d");
                        }
                    }
                }

                const roundIdcompute636 = moment(Number(nextTimecompute636) * 1000).format("YYYYMMDD");

                res.json({
                    status: true,
                    data: {
                        current_round: roundIdcompute636, // eslint-disable-line
                        finish_time: nextTimecompute636 * 1000 // eslint-disable-line
                    },
                    message: "success"
                });

            break;

            case "compute123":
                const nowtimecompute123: any = moment().tz("Asia/Ho_Chi_Minh");
                const currentTimecompute123 = moment().format("YYYY-MM-DD");
                let tomorowTimecompute123: any;


                if(nowtimecompute123.format("H") >= 18) {
                    tomorowTimecompute123 = moment(currentTimecompute123 + " 18:00").add(1, "d").tz("Asia/Ho_Chi_Minh").format("X");
                }else {
                    tomorowTimecompute123 = moment(new Date(moment(nowtimecompute123).format("YYYY/MM/DD") + " 18:00")).tz("Asia/Ho_Chi_Minh").format("X");
                }

                const roundIdcompute123 =  moment(Number(tomorowTimecompute123) * 1000).format("YYYYMMDD");

                res.json({
                    status: true,
                    data: {
                        current_round: roundIdcompute123, // eslint-disable-line
                        finish_time: tomorowTimecompute123 * 1000 // eslint-disable-line
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