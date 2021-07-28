import { Request, Response, Router } from "express";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";


const router = Router();


router.post("/error/:ticketId", async (req: Request, res: Response) => {
    try {
        if (typeof req.params.ticketId !== "undefined") {



        }else {
            res.json({
                status: false,
                message: "ERROR: error params"
            });
        }
    }catch(error) {
        res.json({
            status: false,
            message: error.message
        });
    }
});

export default router;