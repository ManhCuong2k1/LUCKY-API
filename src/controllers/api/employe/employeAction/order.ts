import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import helper from "../../helper/helper";

const router = Router();

router.get("/get-last-orders", async (req: Request, res: Response) => {
    try {

        const TicketPrinter = [];

        const getLastOrder = await LotteryTicketModel.findOne({
            where: { 
                employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED,
                orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY
             },
            order: [["id", "ASC"]],
        });



        switch(getLastOrder.type) {
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


        switch(getLastOrder.type) {
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


        if(getLastOrder !== null) {

            getLastOrder.employeStatus = LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVING;
            await getLastOrder.save();
            await getLastOrder.reload();

            res.json({
                status: true,
                data: getLastOrder,
                signal: helper.employeStringToSignalCode(TicketPrinter)
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