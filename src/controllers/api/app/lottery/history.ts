import { Request, Response, Router } from "express";
import Crawl from "../../crawl/Crawl";

import { LotteryInterface, LotteryModel } from "@models/Lottery";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketInterface, LotteryTicketModel } from "@models/LotteryTicket";

const router = Router();

router.get("/results/:type", async (req: Request, res: Response) => {
    switch (req.params.type) {
        case "keno":
            try {

                const getData = await LotteryModel.findAll();
                res.json(getData);

            }catch (error) {
                res.json({
                    status: false,
                    message: error
                });
            }
        break;

        default:
            res.json({
                status: false,
                message: "error order type params"
            });
        break;
    }
});

export default router;