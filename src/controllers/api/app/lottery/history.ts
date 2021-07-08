import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
const router = Router();



router.get("/results/:type", async (req: Request, res: Response) => {
    let data;
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