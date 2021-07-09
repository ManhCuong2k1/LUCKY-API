import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { UserModel } from "@models/User";
const router = Router();


router.post("/", async (req: Request, res: Response) => {

        try {
            const user: any = req.user;
            const body = req.body;
            

            switch (body.game) {
                case "keno": 

                    const currentTime = helper.getTime(helper.timeStamp());
                    const checkTimeStart = (currentTime.getHours() >= 6) ? true: false; // start if time >= 6h AM
                    const checkTimeStop = (currentTime.getHours() < 22) ? true: false; // stop if time < 22h PM
                    const isActiveOrder = (checkTimeStart && checkTimeStop) ? true: false;

                    
                    if(isActiveOrder) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                        const currentRound: any = await Crawl.getKenoCurrentRound(); // lấy thông tin phiên keno hiện tại

                        let timeOrder = currentRound.data.finish_time;
                        let roundOrder = Number(currentRound.data.current_round);
                        let isFirst = true;
                        let totalPrice = 0;

                        // tính tiền 1 đơn
                        body.data.forEach((data: any) => {
                            totalPrice = totalPrice + data.price;
                        });

                        const orderPrice = totalPrice; // tiền 1 đơn
                        totalPrice = totalPrice * body.preriod; // tiền thanh toán khi đặt liên tiếp các kỳ

                        if(user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                            // trừ tiền truocứ khi order 
                            const UserData = await UserModel.findOne({ where: { id : user.id } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalCoin = UserData.totalCoin - totalPrice;
                            await UserData.save();
                            await UserData.reload();


                            // order
                            for(let i = 1; i <= body.preriod; i++) {

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
                                        totalprice: orderPrice
                                    }),
                                    orderStatus: "delay",
                                    resultStatus: "Chờ Xổ " + timeOrder,
                                    finishTime: timeOrder,
                                    moreDetail: "Đại lý giữ hộ vé"
                                };

                                console.log(dataImport);

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
                                message: "Bạn không đủ tiền!"
                            });
                        }

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