import express, { Response, Request } from "express";
import Crawl from "./Crawl";
const router = express.Router();
import LazadaModel from "@models/LazadaVoucher";

/**
 * @openapi
 * /lazadavoucher:
 *   get:
 *     tags:
 *      - "[API] lazada"
 *     summary: Lấy thông tin tất cả các voucher khuyến mại của lazada
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */

router.get("/", async (req: Request, res: Response) => {
    try {

        Crawl.LazadaCrawl(async () => {
            const lazadavoucherdata = await LazadaModel.LazadaVoucherModel.findAll();

            if(lazadavoucherdata) {
                return res.json({
                    "status": true,
                    "data": lazadavoucherdata
                });                
            } else {
                return res.json({
                    "status": false,
                    "msg": "not have data!"
                });   
            }         
        });

    } catch (e) {
        res.status(401).send({
            code: e.message
        });
    }
});



export default router;