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
<<<<<<< Updated upstream:src/controllers/api/app/lottery/history.ts
=======
});



router.get("/orders", async (req: Request, res: Response) => {
    
    if(req.query.id != null || req.query.id != "") {
        const ordersData = await LotteryOrdersModel.findOne({
            where: {
                id: req.query.id
            }
        });
        res.json(ordersData);
    }else {
        const ordersData = await LotteryOrdersModel.findAll();
        res.json(ordersData);
    }
>>>>>>> Stashed changes:src/controllers/api/app/lottery/geyhistorygame.ts


});


export default router;