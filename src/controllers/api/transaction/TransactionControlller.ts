import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import express, { Response, Request, Router } from "express";
import { auth } from "@middleware/auth";
import momo from "./sdk/momo";
import dotenv from "dotenv";
import { sendError } from "@util/response";
import { UserModel } from "@models/User";
dotenv.config();
const router = Router();


router.get("/endpoint/:type", async (req: Request, res: Response) => {
    res.json({ status: true, message: "Payment Success!" });
});

router.post("/endpoint/:type", async (req: Request, res: Response) => {
    try {

        const transaction: any = req.body;

        switch (req.params.type) {
            case "momo":

                if (typeof transaction.transId !== "undefined") {
                    const idRecharge = transaction.requestId.split(process.env.MOMO_PREFIX_TRANSACTION)[1];

                    const dbTransaction = await LotteryRechargeModel.findOne({
                        where: {
                            id: idRecharge,
                            status: LotteryRechargeModel.STATUS_ENUM.UNPAID,
                            method: LotteryRechargeModel.METHOD_ENUM.MOMO
                        }
                    });

                    if (transaction.errorCode == 0) {
                        if (dbTransaction.id) {

                            const UserData = await UserModel.findOne({ where: { id: dbTransaction.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalCoin = UserData.totalCoin + Number(transaction.amount);
                            await UserData.save();
                            await UserData.reload();

                            dbTransaction.status = LotteryRechargeModel.STATUS_ENUM.PAID;
                            dbTransaction.detail = transaction.message;
                            await dbTransaction.save();
                            await dbTransaction.reload();
                            res.json(dbTransaction);
                        } else {
                            res.json({
                                status: false, message: "This transaction has been processed before"
                            });
                        }
                    } else {
                        dbTransaction.status = LotteryRechargeModel.STATUS_ENUM.ERROR;
                        dbTransaction.detail = transaction.message;
                        await dbTransaction.save();
                        await dbTransaction.reload();
                    }

                } else {
                    res.json({
                        status: false, message: "error request!"
                    });
                }
                break;
        }

    } catch (error) {
        sendError(res, 400, error.message, error);
    }
});

router.post("/", auth, async (req: Request, res: Response) => {

    try {
        const user: any = req.user;
        const transaction = req.body;

        switch (transaction.method) {
            case "momo":
                
                const dataTransaction: any = {
                    userId: user.id,
                    amount: Number(transaction.amount),
                    method: transaction.method,
                    status: LotteryRechargeModel.STATUS_ENUM.UNPAID,
                    detail: "Chờ Xử Lý"
                };
                const makeTransaction = await LotteryRechargeModel.create(dataTransaction);
                console.log("SEND REQUEST TO MOMO...");
                const momoService = new momo();
                momoService.orderId = process.env.MOMO_PREFIX_TRANSACTION + makeTransaction.id.toString();
                momoService.amount = transaction.amount.toString();
                momoService.requestId = process.env.MOMO_PREFIX_TRANSACTION + makeTransaction.id.toString();
                momoService.orderInfo = "Nạp Tiền Lucky PlayLot";
                const postTransaction = await momoService.makePayment();
                res.send(postTransaction);
                break;

            default:
                res.json({ status: false, message: "Error Method Payment" });
                break;
        }

    } catch (error) {
        sendError(res, 400, error.message, error);
    }

});


export default router;