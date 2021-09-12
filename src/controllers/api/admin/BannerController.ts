import { Banner } from "@models/Banner";
import express, { Response, Request } from "express";
import { authAdmin } from "../../../middleware/auth";

const router = express.Router();

/**
 * Thêm mới banner
 */

router.post("/", authAdmin, async (req: Request, res: Response) => {
    try {
        const banners: any[] = req.body.banners;
        await Banner.destroy({ truncate: true });
        await Banner.bulkCreate(banners);
        res.send("success");
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.get("/", authAdmin, async (req: Request, res: Response) => {
    try {
        const dataBanner = await Banner.findAll({
            order: [
                "index"
            ],
        });
        if(dataBanner) {
            res.send(dataBanner);
        } else {
            res.status(400).send("error");
        }
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;