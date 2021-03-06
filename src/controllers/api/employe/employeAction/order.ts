import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { creatSignalCode } from "./creatSignalCode";
import { Op } from "sequelize";

const router = Router();

router.get("/get-last-orders", async (req: Request, res: Response) => {
    try {

        const getLastTicket: any = await LotteryTicketModel.findOne({
            where: {
                employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED,
                orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                [Op.or]: [{
                    type: LotteryTicketModel.GAME_ENUM.POWER
                }, {
                    type: LotteryTicketModel.GAME_ENUM.MEGA
                },{
                    type: LotteryTicketModel.GAME_ENUM.MAX3D
                },{
                    type: LotteryTicketModel.GAME_ENUM.MAX3DPLUS
                },{
                    type: LotteryTicketModel.GAME_ENUM.MAX4D
                }],
            },
            include: [{
                model: UserModel,
                as: "user",
                attributes: {
                    exclude: [
                        "nickname",
                        "otpCode",
                        "fcmtoken",
                        "password",
                        "referrerId",
                        "referralCode",
                        "avatar",
                        "gender",
                        "dateOfBirth",
                        "isEnableReceiveEmail",
                        "totalCoin",
                        "totalReward",
                        "deletedAt"
                    ],
                },
                required: false
            },
            ],
            order: [["id", "ASC"]],
        });

        if (getLastTicket !== null) {

            const getOrderFromTicket = await LotteryOrdersModel.findAll({
                where: {
                    ticketId: getLastTicket.id
                }
            });

            const numberOfPreriod = getOrderFromTicket.length;
            const orders: any [] = [];

            for (const order of getOrderFromTicket) {
                order.toJSON();
                order.orderDetail = JSON.parse(order.orderDetail);
                orders.push(order);
            };
            
            const sinalCode = await creatSignalCode(getLastTicket.type, numberOfPreriod, getLastTicket.totalPrice, getOrderFromTicket);

            getLastTicket.employeStatus = LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVING;
            await getLastTicket.save();
            await getLastTicket.reload();

            getLastTicket.setDataValue("orders", orders);
            getLastTicket.setDataValue("signalCode", sinalCode);

            res.json({
                status: true,
                data: getLastTicket
            });

        } else {
            res.json({
                status: false,
                message: "Hi???n t???i ch??a c?? ????n h??ng n??o c???n x??? l??!"
            });
        }

    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error.message
        });
    }
});

export default router;