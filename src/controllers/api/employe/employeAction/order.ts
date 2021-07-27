import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";

const router = Router();

router.get("/get-last-orders", async (req: Request, res: Response) => {
    try {

        const getLastOrder = await LotteryTicketModel.findOne({
            where: { 
                employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED,
                orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY
             },
            order: [["id", "ASC"]],
        });

        if(getLastOrder !== null) {

            res.json({
                status: true,
                data: getLastOrder
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