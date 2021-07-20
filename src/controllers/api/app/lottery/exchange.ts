import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import { LotteryExchangesInterface, LotteryExchangesModel } from "@models/LotteryExchange";
import sequelize, { Sequelize } from "sequelize";
import { GridInterface } from "@models/Transformers/Grid";

const router = Router();


router.post("/exchange", async (req: Request, res: Response) => {

    const user:any = req.user;
    const transaction:any = req.body;

    switch (transaction.bankcode) {
        case "localcoin":
            try {
                if (typeof req.query.id !== "undefined") {
                    const ordersData = await LotteryOrdersModel.findOne({
                        where: {
                            id: req.query.id
                        }
                    });
                    res.json(ordersData);
                } else {
                    const ordersData = await LotteryOrdersModel.findAll();
                    res.json(ordersData);
                }
            } catch (error) {
                res.json({
                    status: false,
                    message: error
                });
            }
            break;

    }
});