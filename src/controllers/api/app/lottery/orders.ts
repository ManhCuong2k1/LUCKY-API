import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";

const router = Router();


router.post("/", async (req: Request, res: Response) => {

        try {
            const user: any = req.user;
            const body = req.body;
            switch (req.body.game) { 
                case "keno": 

                    const currentTime = helper.getTime(helper.timeStamp());
                    const checkTimeStart = (currentTime.getHours() >= 6) ? true: false; // start if time >= 6h AM
                    const checkTimeStop = (currentTime.getHours() < 22) ? true: false; // stop if time < 22h PM
                    const isActiveOrder = (checkTimeStart && checkTimeStop) ? true: false;

                    if(isActiveOrder) {

                        const currentRound: any = await Crawl.getKenoCurrentRound();

                        let timeOrder = currentRound.data.finish_time;
                        let roundOrder = Number(currentRound.data.current_round);
                        let isFirst = true;

                        for(let i = 1; i <= req.body.preriod; i++) {

                            if(isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 10);
                                roundOrder = Number(roundOrder) + 1;
                            }

                            const dataImport: any = {
                                userId: user.id,
                                type: "keno",
                                roundId: "00"+roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: body.totalprice
                                }),
                                orderStatus: "delay",
                                resultStatus: "Chờ Xổ " + timeOrder,
                                finishTime: timeOrder
                            };

                            LotteryOrdersModel.create(dataImport);

                            isFirst = false;
                        }

                        res.json({
                            status: true,
                            message: "Đặt Vé Thành Công!"
                        });
                    }else {
                        res.json({
                            status: false,
                            message: "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé Keno!"
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

        } catch (err) {
            console.log(err);
            res.json({
                status: false,
                msg: err.message
            });
        }
});




export default router;