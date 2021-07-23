import { Banner } from "@models/Banner";
import express, { Response, Request } from "express";
import { GridInterface } from "@models/Transformers/Grid";
import { Op } from "sequelize";

const router = express.Router();

/**
 * Thêm mới banner
 */

router.post("/", async (req: Request, res: Response) => {
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

router.get("/", async (req: Request, res: Response) => {
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
