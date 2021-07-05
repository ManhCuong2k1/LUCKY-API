import express, { Response, Request } from "express";
import Crawl from "./Crawl";
import ShopeeModel from "@models/ShopeeVoucher";


const router = express.Router();

/**
 * @openapi
 * /shopeevoucher:
 *   get:
 *     tags:
 *      - "[API] shopeevoucher"
 *     summary: Lấy thông tin tất cả các voucher khuyến mại của shopee
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
      await Crawl.ShoppeCrawl();
      return res.json({ status: true });
  } catch (e) {
      res.status(401).send({
          code: e.message
      });
  }
});

router.get("/get-details/:coupon", async (req: Request, res: Response) => {
    try {
        const getDetails = await Crawl.getShopeeDetail(req.params.code);
        console.log(getDetails);
        res.send(getDetails);

    }catch(e) {
        res.status(401).send({
            code: e.message
        });
    }
});


export default router;
