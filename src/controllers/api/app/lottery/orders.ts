import { Request, Response, Router } from "express";
import Crawl from "../../crawl/Crawl";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";

const router = Router();


router.post("/", async (req: Request, res: Response) => {

    try {
        const user: any = req.user;
        const body = req.body;
        switch (req.body.game) {
            case "keno":
                const currentRound: any = await Crawl.getKenoCurrentRound();

                const dataImport: any = {
                    userId: user.id,
                    type: "keno",
                    roundId: currentRound.data.current_round,
                    orderDetail: JSON.stringify({
                        level: body.level,
                        preriod: body.preriod,
                        data: body.data
                    }),
                    orderStatus: "delay",
                    resultStatus: "Chờ Xổ " + currentRound.data.finish_time,
                    finishTime: currentRound.data.finish_time
                };

                LotteryOrdersModel.create(dataImport);

                res.json({
                    status: true,
                    message: "Đặt Vé Thành Công!"
                });
                break;

            default:
                res.json({
                    status: false,
                    message: "error order type params"
                });
                break;
        }

    } catch (err) {
        console.log(err);
        return {
            status: false,
            msg: err.message
        };
    }

});




export default router;