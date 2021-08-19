import express, { Response, Request } from "express";
import { UserModel } from "@models/User";
import { LotteryExchangesModel } from "@models/LotteryExchanges";
import { GridInterface } from "@models/Transformers/Grid";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
import { col, fn, Op } from "sequelize";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const status: string = req.query.status ? req.query.status.toString() : null;

        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            status === null ? null : { status },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { phone: { [Op.like]: `%${searchKey.trim()}%` } },
        );

        const { rows, count } = await LotteryExchangesModel.findAndCountAll({
            where,
            include: {
                model: UserModel,
                attributes: ["name", "identify", "phone"],
                as: "user_exchange",
                where: whereUser,
            },
            distinct: true,
            limit: pageSize,
            offset: cursor,
            order: [
                ["createdAt", "DESC"],
            ],
        });
        const responseData: GridInterface<LotteryExchangesModel> = {
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

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const dataExchange = await LotteryExchangesModel.findByPk(id);
        if(dataExchange) {
            dataExchange.status = LotteryExchangesModel.STATUS_ENUM.SUCCESS;
            dataExchange.save();
            res.send(dataExchange);
        } else {
            res.status(400).send("Cannot find dataExchange");
        }
    } catch (error) {
        res.send(error);
    }
});

router.get("/detail", async (req: Request, res: Response) => {
    try {
        const whereToday: any = Object.assign({},
            { createdAt: { [Op.between]: [moment().startOf("day").format(), moment().format()] } }
        );
        const dataExchange = await LotteryExchangesModel.findAll({
            where : {
                ...whereToday,
                status: LotteryExchangesModel.STATUS_ENUM.DELAY,
            },
            attributes: [
                [fn("count", col("id")), "total_exchange"],
            ],
        });
        if(dataExchange) {
            res.send(dataExchange);
        } else {
            res.status(400).send("Cannot find dataExchange");
        }
    } catch (error) {
        res.send(error);
    }
});

export default router;
