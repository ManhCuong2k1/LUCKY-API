import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import helper from "@controllers/api/helper/helper";
import updateTicket from "../app/lottery/updateresult";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketInterface, LotteryTicketModel } from "@models/LotteryTicket";

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
                const updateData = updateTicket.updateResult("keno", crawling.data);
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
        case "max3d":
            try {
                const crawling = await Crawl.XosoMax3dData();
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
router.get("/get-keno-round", async (req: express.Request, res: Response) => {
    
    const getKenoRoud: any = await Crawl.getKenoCurrentRound();
    const datExport: any = {
        status: true,
        data: {
            current_round: getKenoRoud.data.current_round, // eslint-disable-line
            finish_time: Date.parse(getKenoRoud.data.finish_time) // eslint-disable-line
        },
        message: "success"
    };

    res.send(datExport);
});
/* eslint-enable no-alert, no-console */




router.get("/results/:type", async (req: Request, res: Response) => {
    try {
        if (typeof req.query.id !== "undefined") {
            const resultsData = await LotteryModel.findOne({
                where: {
                    id: req.query.id,
                    type: req.query.type
                }
            });
            res.json(resultsData);
        } else {
            const resultsData = await LotteryModel.findAll({
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
            message: error
        });
    }
});



export default router;