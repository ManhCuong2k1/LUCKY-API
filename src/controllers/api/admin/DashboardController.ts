import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import { LotteryExchangesModel } from "@models/LotteryExchange";

import { Router, Request, Response } from "express";
import moment from "moment-timezone";
import { col, fn, Op } from "sequelize";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {

        const whereToday: any = Object.assign({},
            { createdAt: { [Op.between]: [moment().startOf("day").format(), moment().format()] } }
        );
         const whereWeek = Object.assign({},
            { createdAt: { [Op.between]: [moment().startOf("week").format(), moment().format()] } }
        );

        // Số vé bán trong ngày
        const numberTicketToday = await LotteryTicketModel.findAll({
            where: whereToday,
            attributes: [
                [fn("count", col("id")), "total_ticket"],
            ],
        });


        // Doanh thu trong ngày
        const  revenueToday = await LotteryTicketModel.findAll({
            where: whereToday,
            attributes: [
                [fn("sum", col("totalPrice")), "total_revenue"]
            ],
        });


        // Số tiền nạp trong ngày
        const rechargeToday = await LotteryRechargeModel.findAll({
            where: whereToday,
            attributes: [
                [fn("sum", col("amount")), "total_recharge"],
            ],
        });

        // Số tiền đổi thưởng trong ngày
        const exchangesToday = await LotteryExchangesModel.findAll({
            where: {
                ...whereToday,
                status: LotteryExchangesModel.STATUS_ENUM.SUCCESS
            },
            attributes: [
                [fn("sum", col("amount")), "total_exchanges"],
            ],
        });


        // Số vé bán trong tuần
        const numberTicketWeek = await LotteryTicketModel.findAll({
            where: whereWeek,
            attributes: [
                [fn("count", col("id")), "total_ticket_week"],
            ],
        });


        // Doanh thu trong tuần
        const  revenueWeek = await LotteryTicketModel.findAll({
            where: whereWeek,
            attributes: [
                [fn("sum", col("totalPrice")), "total_revenue_week"]
            ],
        });


        // Số tiền nạp trong tuần
        const rechargeWeek = await LotteryRechargeModel.findAll({
            where: whereWeek,
            attributes: [
                [fn("sum", col("amount")), "total_recharge_week"],
            ],
        });

        // Số tiền đổi thưởng trong tuần
        const exchangesWeek = await LotteryExchangesModel.findAll({
            where: {
                ...whereWeek,
                status: LotteryExchangesModel.STATUS_ENUM.SUCCESS
            },
            attributes: [
                [fn("sum", col("amount")), "total_exchanges_week"],
            ],
        });

        const whereTicketByMonth = Object.assign({},
            { createdAt: { [Op.between]: [moment().startOf("month").format(), moment().format()] } }
        );
        const amountTicketByDay = await LotteryTicketModel.findAll({
            where: whereTicketByMonth,
            attributes: [
                [fn("DATE_FORMAT", col("createdAt"), "%Y%m%d"), "formatCreatedAt"],
                [fn("count", col("id")), "count"],
            ],
            group: "formatCreatedAt"
        });

        // Doanh thu theo ngay
        const sumOrderByDay = await LotteryTicketModel.findAll({
            where: whereTicketByMonth,
            attributes: [
                [fn("DATE_FORMAT", col("createdAt"), "%Y%m%d"), "formatCreatedAt"],
                [fn("sum", col("totalPrice")), "total_price"],
            ],
            group: "formatCreatedAt"
        });

        

        res.send({
            numberTicketToday,
            revenueToday,
            rechargeToday,
            exchangesToday,
            numberTicketWeek,
            revenueWeek,
            rechargeWeek,
            exchangesWeek,
            amountTicketByDay,
            sumOrderByDay
        });
    }
    catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
