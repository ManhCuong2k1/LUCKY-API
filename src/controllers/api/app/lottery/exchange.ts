import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryExchangesModel } from "@models/LotteryExchanges";

const router = Router();


/**
 * @openapi
 *   post:
 *     tags:
 *      - "[Transaction] Payment & Recharge"
 *     summary:  API tạo giao dịch nạp tiền
 *     security:
 *      - Bearer: []
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "thông tin người dùng gửi lên"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            method:
 *              type: "string"
 *            nickname:
 *              type: "string"
 *            avatar:
 *              type: "string"
 *            gender:
 *              type: "string"
 *            identify:
 *              type: "string"
 *            dateOfbirth:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */



router.post("/", async (req: Request, res: Response) => {

    const user: any = req.user;
    const transaction: any = req.body;

    if (typeof transaction.amount !== "undefined") {

        const minLocal = 100000;
        const minwallet = 100000;
        const minBank = 100000;

        let methodPayment: string;


        switch (transaction.method) {
            case "local":
                try {
                    if (transaction.amount >= minLocal) {
                        if (user.totalReward >= Number(transaction.amount)) {

                            const User = await UserModel.findByPk(user.id);
                            User.totalReward = User.totalReward - Number(transaction.amount);
                            User.totalCoin = User.totalCoin + Number(transaction.amount);
                            await User.save();
                            await User.reload();

                            const dataImport: any = {
                                userId: user.id,
                                amount: transaction.amount,
                                bankCode: LotteryExchangesModel.BANKCODE_ENUM.LOCAL,
                                bankNumber: user.phone,
                                bankUserName: user.name,
                                status: LotteryExchangesModel.STATUS_ENUM.SUCCESS,
                            };
                            LotteryExchangesModel.create(dataImport);

                            res.json({
                                status: true,
                                message: "Đổi thưởng thành công!"
                            });
                        } else {
                            res.json({
                                status: false,
                                message: "Số tiền thưởng của bạn không đủ"
                            });
                        }
                    } else {
                        res.json({
                            status: false,
                            message: "Hạn mức đổi thưởng tối thiểu là " + minLocal
                        });
                    }

                } catch (error) {
                    res.json({
                        status: false,
                        message: error
                    });
                }
            break;

            case "wallet":
                try {
                    if (Number(transaction.amount) >= minwallet) {
                        if (user.totalReward >= Number(transaction.amount)) {

                            const User = await UserModel.findByPk(user.id);
                            User.totalReward = User.totalReward - Number(transaction.amount);
                            await User.save();
                            await User.reload();

                            const dataImport: any = {
                                userId: user.id,
                                amount: Number(transaction.amount),
                                bankCode: transaction.bankcode,
                                bankNumber: user.phone,
                                bankUserName: user.name,
                                status: LotteryExchangesModel.STATUS_ENUM.DELAY,
                            };
                            LotteryExchangesModel.create(dataImport);

                            res.json({
                                status: true,
                                message: "Thành Công! Chờ Duyệt Thưởng!"
                            });
                        } else {
                            res.json({
                                status: false,
                                message: "Số tiền thưởng của bạn không đủ"
                            });
                        }
                    } else {
                        res.json({
                            status: false,
                            message: "Hạn mức đổi thưởng tối thiểu là " + minLocal
                        });
                    }

                } catch (error) {
                    res.json({
                        status: false,
                        message: error
                    });
                }
            break;

            case "bank":
                try {
                    if (Number(transaction.amount) >= minBank) {
                        if (user.totalReward >= Number(transaction.amount)) {

                            const User = await UserModel.findByPk(user.id);
                            User.totalReward = User.totalReward - Number(transaction.amount);
                            await User.save();
                            await User.reload();
                            
                            const dataImport: any = {
                                userId: user.id,
                                amount: Number(transaction.amount),
                                bankCode: transaction.bankcode,
                                bankNumber: transaction.banknumber,
                                bankUserName: transaction.bankname,
                                status: LotteryExchangesModel.STATUS_ENUM.DELAY,
                            };
                            LotteryExchangesModel.create(dataImport);

                            res.json({
                                status: true,
                                message: "Thành Công! Chờ Duyệt Thưởng!"
                            });
                        } else {
                            res.json({
                                status: false,
                                message: "Số tiền thưởng của bạn không đủ"
                            });
                        }
                    } else {
                        res.json({
                            status: false,
                            message: "Hạn mức đổi thưởng tối thiểu là " + minLocal
                        });
                    }

                } catch (error) {
                    res.json({
                        status: false,
                        message: error
                    });
                }
            break;

        }
}else {
    res.json({
        status: false,
        message: "erorr params"
    });
}

    });


export default router;