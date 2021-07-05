import express, { Response, Request } from "express";
import Crawl from "./Crawl";
const router = express.Router();


/**
 * @openapi
 * /tikivoucher:
 *   get:
 *     tags:
 *      - "[API] tikivoucher"
 *     summary: Lấy thông tin tất cả các voucher khuyến mại của tiki
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
        await Crawl.TikiCrawl();
        return res.json({ status: true });
    } catch (e) {
        res.status(401).send({
            code: e.message
        });
    }
});



// /**
//  * @openapi
//  * /tikivoucher/{type}:
//  *   get:
//  *     tags:
//  *      - "[App] tikivoucher"
//  *     summary: Lấy thông tin tất cả các voucher khuyến mại của tiki theo loại
//  *     parameters:
//  *      - name: "type"
//  *        in: "path"
//  *        description: "fast_coupon"
//  *        required: true
//  *        type: "string"
//  *     responses:
//  *       200:
//  *         description: Return data.
//  *       400:
//  *         description: Error can't get data.
//  *     security:
//  *      - Bearer: []
//  */

// router.get("/:type", async (req: Request, res: Response) => {
//     try {
//         const type: any = req.params.type.toString();

//         console.log(type);


//         Crawl.TikiCrawl(async () => {
//             const tikivoucherdata = await TikiModel.TikiVoucherModel.findAll({
//                 where: {
//                     category: type,
//                     status: "active"
//                 }
//             });

//             if (tikivoucherdata) {
//                 return res.json({
//                     "status": true,
//                     "data": tikivoucherdata
//                 });
//             } else {
//                 return res.json({
//                     "status": false,
//                     "msg": "not have data!"
//                 });
//             }
//         });


//     } catch (e) {
//         res.status(401).send({
//             code: e.message
//         });
//     }
// });


export default router;