import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import helper from "@controllers/api/helper/helper";
import update from "../app/lottery/updateresult";

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
                const updateData = update.updateResult('keno', crawling.data);
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


router.get("/get-keno-round", async (req: express.Request, res: Response) => {
    const a = await Crawl.getKenoCurrentRound();
    res.send(a);
});

router.get("/dd", (req: Request, res: Response) => {
    res.send(helper.addMinuteToTime("2021/7/07 20:0:0", 10));
});

export default router;