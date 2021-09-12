import { Router, Request, Response } from "express";
import { LotteryStoragesModel } from "@models/LotteryStorage";
import { GridInterface } from "@models/Transformers/Grid";
import { authAdmin } from "../../../middleware/auth";
import { Op } from "sequelize";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const router = Router();


router.get("/", authAdmin, async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            searchKey === null ? null : { date: { [Op.like]: `%${searchKey.trim()}%` } },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );

        const { rows, count } = await LotteryStoragesModel.findAndCountAll({
            where,
            distinct: true,
            limit: pageSize,
            offset: cursor,
            order: [
                ["createdAt", "DESC"],
            ],
        });
        const responseData: GridInterface<LotteryStoragesModel> = {
            data: rows,
            page: page,
            pageSize: pageSize,
            total: count
        };
        res.send(responseData );
    } catch (e) {
        res.status(400).send({
        error: e.message,
        });
    }
});

export default router;