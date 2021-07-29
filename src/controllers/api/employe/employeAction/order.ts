import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import helper from "../../helper/helper";

const router = Router();

router.get("/get-last-orders", async (req: Request, res: Response) => {
    try {

        const TicketPrinter: any = [];

        const getLastTicket = await LotteryTicketModel.findOne({
            where: { 
                employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED,
                orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY
             },
             include: [{
                model: UserModel,
                as: "user",
                attributes: { 
                    exclude: [
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
            }],
            order: [["id", "ASC"]],
        });

        if(getLastTicket !== null) {

            const getOrderFromTicket = await LotteryOrdersModel.findAll({
                where: {
                    ticketId: getLastTicket.id
                }
            });

            switch(getLastTicket.type) {
                case LotteryTicketModel.GAME_ENUM.KENO:
                    TicketPrinter.push("keno");
                    TicketPrinter.push("1ky");
                break;
                case LotteryTicketModel.GAME_ENUM.POWER:
                    TicketPrinter.push("6tren55");
                break;
                case LotteryTicketModel.GAME_ENUM.MEGA:
                    TicketPrinter.push("6tren45");
                break;
                case LotteryTicketModel.GAME_ENUM.MAX3D:
                    TicketPrinter.push("3d");
                break;
                case LotteryTicketModel.GAME_ENUM.MAX3DPLUS:
                    TicketPrinter.push("3dplus");
                break;
                case LotteryTicketModel.GAME_ENUM.MAX4D:
                    TicketPrinter.push("4d");
                break;
            }

            
            const arrListOnPrinter = [
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
            ];

            const run = 0;

            getOrderFromTicket.forEach((order: any) => {
        
                switch(order.type) {
                    case LotteryTicketModel.GAME_ENUM.KENO:
                        TicketPrinter.push("keno");
                    break;
                    case LotteryTicketModel.GAME_ENUM.POWER:
                        TicketPrinter.push("power");
                    break;
                    case LotteryTicketModel.GAME_ENUM.MEGA:
                        TicketPrinter.push("mega");
                    break;
                    case LotteryTicketModel.GAME_ENUM.MAX3D:
                        TicketPrinter.push("3d");
                    break;
                    case LotteryTicketModel.GAME_ENUM.MAX3DPLUS:
                        TicketPrinter.push("3dplus");
                    break;
                    case LotteryTicketModel.GAME_ENUM.MAX4D:
                        TicketPrinter.push("4d");
                    break;
                }
        


            });




            getLastTicket.employeStatus = LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVING;
            await getLastTicket.save();
            await getLastTicket.reload();

            res.json({
                status: true,
                data: getLastTicket,
                //signal: helper.employeStringToSignalCode(TicketPrinter)
            });

        }else {
            res.json({
                status: false,
                message: "Hiện tại chưa có đơn hàng nào cần xử lý!"
            });
        }

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
});

export default router;