import CrawlVoucher from "@models/CrawlVoucher";
import { Router, Request, Response } from "express";
import Crawl from "../crawl/Crawl";
const router = Router();

/**
 * @openapi
 * /crawl-coupon/start/:shopId:
 *   get:
 *     tags:
 *      - "[API] Coupon"
 *     summary: Crawl a shop's coupon
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
        const shopId = req.params.shopId;
        switch (shopId) {
            case "shopee":
                break;
        
            default:
                break;
        }
        
  
    } catch (e) {
        res.status(401).send({
            code: e.message
        });
    }
});

export default router;