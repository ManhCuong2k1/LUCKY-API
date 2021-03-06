import { Response, Request, Router } from "express";
import querystring from "qs";
import crypto from "crypto";
import dateformat from "dateformat";
import { auth } from "@middleware/auth";
import momo from "./sdk/momo";
import vnpay from "./sdk/vnpay";
import dotenv from "dotenv";
import { sendError } from "@util/response";
import { UserModel } from "@models/User";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import { UserHistoryAdd, UserHistoryModel } from "@models/LotteryUserHistory";
import helper from "../helper/helper";

dotenv.config();
const router = Router();


router.post("/", auth, async (req: Request, res: Response) => {

    try {
        const user: any = req.user;
        const transaction = req.body;

        switch (transaction.method) {
            case "momo":

                const dataTransactionMomo: any = {
                    userId: user.id,
                    amount: Number(transaction.amount),
                    method: LotteryRechargeModel.METHOD_ENUM.MOMO,
                    status: LotteryRechargeModel.STATUS_ENUM.UNPAID,
                    detail: LotteryRechargeModel.DETAIL_ENUM.DELAY
                };
                const makeTransactionMomo = await LotteryRechargeModel.create(dataTransactionMomo);
                console.log("SEND REQUEST TO MOMO...");
                const momoService = new momo();
                momoService.orderId = process.env.MOMO_PREFIX_TRANSACTION + makeTransactionMomo.id.toString();
                momoService.amount = transaction.amount.toString();
                momoService.requestId = process.env.MOMO_PREFIX_TRANSACTION + makeTransactionMomo.id.toString();
                momoService.orderInfo = "Nạp Tiền Lucky PlayLot";
                const respMomo = await momoService.makePayment();

                if (respMomo.errorCode == 0) {

                    await UserHistoryAdd(
                        user.id,
                        UserHistoryModel.ACTION_SLUG_ENUM.RECHARGE,
                        UserHistoryModel.ACTION_NAME_ENUM.RECHARGE,
                        "Vừa tạo yêu cầu nạp " + helper.numberformat(Number(transaction.amount)) + " VND bằng ví điện tử Momo"
                    );

                    res.json({
                        status: true,
                        data: respMomo,
                        message: "Sucess"
                    });
                } else {
                    res.json({
                        status: false,
                        data: respMomo.message,
                        message: "Error"
                    });
                }
                break;

            case "vnpay":

                const dataTransactionVnpay: any = {
                    userId: user.id,
                    amount: Number(transaction.amount),
                    method: LotteryRechargeModel.METHOD_ENUM.VNPAY,
                    status: LotteryRechargeModel.STATUS_ENUM.UNPAID,
                    detail: LotteryRechargeModel.DETAIL_ENUM.DELAY
                };
                const makeTransactionVnpay = await LotteryRechargeModel.create(dataTransactionVnpay);
                console.log("SEND REQUEST TO VNPAY...");
                const vnpayService = new vnpay();
                vnpayService.amount = Number(transaction.amount.toString());
                vnpayService.ipAccess = "118.71.10.19";
                vnpayService.bankCode = req.body.bankcode;
                vnpayService.orderId = process.env.VNP_PREFIX_TRANSACTION + makeTransactionVnpay.id.toString();
                vnpayService.orderType = "billpayment"; // giữ nguyên
                vnpayService.orderInfo = "naptien";
                const postTransactionVnpay = await vnpayService.makePayment();


                await UserHistoryAdd(
                    user.id,
                    UserHistoryModel.ACTION_SLUG_ENUM.RECHARGE,
                    UserHistoryModel.ACTION_NAME_ENUM.RECHARGE,
                    "Vừa tạo yêu cầu nạp " + helper.numberformat(Number(transaction.amount)) + " VND bằng ví điện tử VNPay"
                );

                res.json({ status: true, url: postTransactionVnpay });
                break;

            default:
                res.json({ status: false, message: "Error Method Payment" });
                break;
        }

    } catch (error) {
        sendError(res, 400, error.message, error);
    }

});




/**
 * @openapi
 * /endpoint/:type:
 *   post:
 *     tags:
 *      - "[Transaction] Payment & Recharge"
 *     summary: IPN nhận dữ liệu từ bên thứ ba và hoàn thành giao dịch trên hệ thống theo phương thức POST
 *     parameters:
 *      - in: "formData"
 *        description: "thông tin nhận từ bên thứ 3"
 *        require: false
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */

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
                            dbTransaction.detail = LotteryRechargeModel.DETAIL_ENUM.SUCCESS;
                            await dbTransaction.save();
                            await dbTransaction.reload();
                            res.send("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><center>Nạp tiền thành công. vui lòng quay trở lại App!</h1></center>");
                        } else {
                            res.json({
                                status: false, message: "This transaction has been processed before"
                            });
                        }
                    } else {
                        dbTransaction.status = LotteryRechargeModel.STATUS_ENUM.ERROR;
                        dbTransaction.detail = LotteryRechargeModel.DETAIL_ENUM.ERROR;
                        await dbTransaction.save();
                        await dbTransaction.reload();
                    }

                } else {
                    res.json({
                        status: false, message: "error request!"
                    });
                }
                break;

            default:
                res.json({
                    status: false,
                    message: "error params method"
                });
                break;


        }

    } catch (error) {
        sendError(res, 400, error.message, error);
    }
});

/**
 * @openapi
 * /endpoint/:type:
 *   get:
 *     tags:
 *      - "[Transaction] Payment & Recharge"
 *     summary: IPN nhận dữ liệu từ bên thứ ba và hoàn thành giao dịch trên hệ thống theo phương thức GET
 *     parameters:
 *      - in: "formData"
 *        description: "thông tin nhận từ bên thứ 3"
 *        require: false
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */

router.get("/endpoint/:type", async (req: Request, res: Response) => {
    try {
        const transaction: any = req.query;

        switch (req.params.type) {


            case "momo":

                if (typeof transaction.transId !== "undefined") {
                    if (transaction.errorCode == 0) {
                        res.send("Nạp tiền thành công. vui lòng quay trở lại App!");
                    } else {
                        res.send("Nạp tiền thất bại. vui lòng quay trở lại App và thử lại!");
                    }
                } else {
                    res.json({
                        status: false, message: "error request!"
                    });
                }

                break;


            case "vnpay":

                if (typeof transaction.vnp_TxnRef !== "undefined" && typeof transaction.vnp_TransactionNo !== "undefined") {

                    const idRecharge = transaction.vnp_TxnRef.split(process.env.VNP_PREFIX_TRANSACTION)[1];

                    const dbTransaction = await LotteryRechargeModel.findOne({
                        where: {
                            id: idRecharge,
                            status: LotteryRechargeModel.STATUS_ENUM.UNPAID,
                            method: LotteryRechargeModel.METHOD_ENUM.VNPAY
                        }
                    });

                    if (dbTransaction !== null) {
                        if (transaction.vnp_ResponseCode == "00") {
                            res.send("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">Nạp tiền thành công. vui lòng quay trở lại App!");
                        } else {
                            res.send("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">Nạp tiền thất bại!");
                        }

                    } else {
                        res.send("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><center>Yêu cầu nạp tiền này đã được xử lý! Vui lòng quay lại App</h1></center>");
                    }

                } else {
                    res.json({
                        status: false, message: "error request!"
                    });
                }

                break;

            default:
                res.json({
                    status: false,
                    message: "error params method"
                });
                break;
        }

    } catch (error) {
        sendError(res, 400, error.message, error);
    }
});



router.get("/callback/:type", async (req: Request, res: Response) => {
    try {
        let transaction: any = req.query;

        switch (req.params.type) {

            case "vnpay":

                if (typeof transaction.vnp_TxnRef !== "undefined" && typeof transaction.vnp_TransactionNo !== "undefined") {

                    const sortObject = (o: any) => {
                        const sorted: any = {};
                        let key: any;
                        const a = [];
                        for (key in o) {
                            if (o.hasOwnProperty(key)) {
                                a.push(encodeURIComponent(key));
                            }
                        }
                        a.sort();
                        for (key = 0; key < a.length; key++) {
                            sorted[a[key]] = encodeURIComponent(o[a[key]]).replace(/%20/g, "+");
                        }
                        return sorted;
                    };

                    const secureHash = transaction["vnp_SecureHash"];
                    delete transaction["vnp_SecureHash"];
                    delete transaction["vnp_SecureHashType"];

                    transaction = sortObject(transaction);

                    const secretKey = process.env.VNP_HASHSCRET;
                    const signData = querystring.stringify(transaction, { encode: false });
                    const hmac = crypto.createHmac("sha512", secretKey);
                    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

                    if (secureHash === signed) {

                        const idRecharge = transaction["vnp_TxnRef"].split(process.env.VNP_PREFIX_TRANSACTION)[1];

                        const dbTransaction = await LotteryRechargeModel.findOne({
                            where: {
                                id: idRecharge,
                                method: LotteryRechargeModel.METHOD_ENUM.VNPAY
                            }
                        });

                        if (dbTransaction !== null) {


                            if (Number(dbTransaction.amount) * 100 == parseInt(transaction["vnp_Amount"])) {


                                if (dbTransaction.status == LotteryRechargeModel.STATUS_ENUM.UNPAID) {



                                    if (transaction.vnp_ResponseCode == "00") {

                                        const UserData = await UserModel.findOne({ where: { id: dbTransaction.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        const realCoin = Number(transaction.vnp_Amount) / 100;
                                        UserData.totalCoin = UserData.totalCoin + realCoin;
                                        await UserData.save();
                                        await UserData.reload();

                                        dbTransaction.status = LotteryRechargeModel.STATUS_ENUM.PAID;
                                        dbTransaction.detail = LotteryRechargeModel.DETAIL_ENUM.SUCCESS;
                                        await dbTransaction.save();
                                        await dbTransaction.reload();
                                        res.json({
                                            Message: "Confirm Success",
                                            RspCode: "00"
                                        });

                                    } else {
                                        dbTransaction.status = LotteryRechargeModel.STATUS_ENUM.ERROR;
                                        dbTransaction.detail = LotteryRechargeModel.DETAIL_ENUM.ERROR;
                                        await dbTransaction.save();
                                        await dbTransaction.reload();
                                        res.json({
                                            Message: "Confirm Success",
                                            RspCode: "00"
                                        });
                                    }


                                } else if (dbTransaction.status == LotteryRechargeModel.STATUS_ENUM.PAID) {
                                    res.json({
                                        Message: "Order already confirmed",
                                        RspCode: "02"
                                    });
                                } else if (dbTransaction.status == LotteryRechargeModel.STATUS_ENUM.ERROR) {
                                    res.json({
                                        Message: "Order already confirmed",
                                        RspCode: "02"
                                    });
                                }

                            } else {
                                res.json({
                                    Message: "Invalid amount",
                                    RspCode: "04"
                                });
                            }


                        } else {
                            res.json({
                                Message: "Order Not Found",
                                RspCode: "01"
                            });
                        }

                    } else {
                        res.json({
                            Message: "Invalid Checksum",
                            RspCode: "97"
                        });
                    }

                } else {
                    res.json({
                        status: false, message: "error request!"
                    });
                }

                break;

            default:
                res.json({
                    status: false,
                    message: "error params method"
                });
                break;
        }

    } catch (error) {
        res.json({
            RspCode: "99",
            Message: "Unknow error"
        });
    }
});


export default router;