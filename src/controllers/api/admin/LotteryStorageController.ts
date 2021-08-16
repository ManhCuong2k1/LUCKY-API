import { Router, Request, Response } from "express";
import { LotteryStoragesModel } from "@models/LotteryStorage";
import { GridInterface } from "@models/Transformers/Grid";
import { Op } from "sequelize";
import moment from "moment-timezone";
const router = Router();


router.get("/", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            searchKey === null ? null : { date: { [Op.like]: `%${searchKey.trim()}%` } },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day").subtract(8, "hours"), moment(toDate).endOf("day").subtract(8, "hours")] } } : null
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