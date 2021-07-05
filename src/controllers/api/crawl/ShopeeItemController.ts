import express, { Response, Request } from "express";
import ShopeeItem from "./CrawlHelper/ShopeeItem";
const router = express.Router();

router.post("/", async (req, res) => {
    const getItem = await ShopeeItem.itemShopee(req.body.url);
    const getCouponData = await ShopeeItem.getCouponData();
    res.json({ 
        data: getItem,
        voucher: getCouponData
        });
});


export default router;