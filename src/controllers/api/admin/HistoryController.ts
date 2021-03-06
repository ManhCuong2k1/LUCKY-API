import express, { Response, Request } from "express";
import { UserModel } from "@models/User";
import { UserHistoryModel } from "@models/LotteryUserHistory";
import { GridInterface } from "@models/Transformers/Grid";
import { authAdmin } from "../../../middleware/auth";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
import { Op } from "sequelize";

const router = express.Router();

router.get("/", authAdmin, async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const searchCardId: string = req.query.searchCardId ? req.query.searchCardId.toString() : null;
        const actionSlug: string = req.query.actionSlug ? req.query.actionSlug.toString() : null;

        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            actionSlug === null ? null : { actionSlug },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { name: { [Op.like]: `%${searchKey.trim()}%` } },
            searchCardId === null ? null : { identify: { [Op.like]: `%${searchCardId.trim()}%` } },
        );

        const { rows, count } = await UserHistoryModel.findAndCountAll({
            where,
            include: {
                model: UserModel,
                attributes: ["name", "phone", "identify", "email"],
                as: "user",
                where: whereUser,
            },
            distinct: true,
            limit: pageSize,
            offset: cursor,
            order: [
                ["createdAt", "DESC"],
            ],
        });
        const responseData: GridInterface<UserHistoryModel> = {
            data: rows,
            page: page,
            pageSize: pageSize,
            total: count
        };
        
        res.send(responseData );
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
