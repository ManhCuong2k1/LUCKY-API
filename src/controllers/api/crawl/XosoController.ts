import express, { Response, Request } from "express";
import Crawl from "./Crawl";

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

export default router;