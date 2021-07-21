import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryTicketInterface, LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
import { UserModel } from "@models/User";
const router = Router();


router.post("/", async (req: Request, res: Response) => {

    try {

        const user: any = req.user;
        const body = req.body;
        let status = true, message, dataImport: any = null;

        switch (body.game) { // kiểm tra user order game nào
            case "keno":

                const currentTime = helper.getTime(helper.timeStamp());
                const checkTimeStart = (currentTime.getHours() >= 6) ? true : false; // start if time >= 6h AM
                const checkTimeStop = (currentTime.getHours() < 22) ? true : false; // stop if time < 22h PM
                const isActiveOrder = (checkTimeStart && checkTimeStop) ? true : false;


                if (isActiveOrder) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    const currentRound: any = await Crawl.getKenoCurrentRound(); // lấy thông tin phiên keno hiện tại

                    let timeOrder = currentRound.data.finish_time;
                    let roundOrder = Number(currentRound.data.current_round);
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = 0;

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * body.preriod) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: body.game,
                            preriod: body.preriod,
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Keno",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= body.preriod; i++) {

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 10);
                                console.log(timeOrder);
                                roundOrder = Number(roundOrder) + 1;
                            }

                            switch (body.childgame) {  // kiểm tra user order chidlgaame nao
                                case "basic": // choi số trùng bình thường

                                    dataImport = {
                                        ticketId: creatTicket.id,
                                        userId: user.id,
                                        type: "keno",
                                        roundId: "00" + roundOrder,
                                        orderDetail: JSON.stringify({
                                            childgame: "basic",
                                            level: body.level,
                                            data: body.data,
                                            totalprice: orderPrice
                                        }),
                                        orderStatus: "delay",
                                        resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + timeOrder,
                                        finishTime: timeOrder,
                                        moreDetail: "Đại lý giữ hộ vé"
                                    };

                                    isFirst = false;
                                    status = true, message = "Đặt Vé Thành Công!";
                                    break;

                                case "chanle_lonnho": // chơi kiểu chẵn lẻ 
                                    dataImport = {
                                        ticketId: creatTicket.id,
                                        userId: user.id,
                                        type: "keno",
                                        roundId: "00" + roundOrder,
                                        orderDetail: JSON.stringify({
                                            childgame: "chanle_lonnho",
                                            data: body.data,
                                            totalprice: orderPrice
                                        }),
                                        orderStatus: "delay",
                                        resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + timeOrder,
                                        finishTime: timeOrder,
                                        moreDetail: "Đại lý giữ hộ vé"
                                    };
                                    isFirst = false;
                                    status = true, message = "Đặt Vé Thành Công!";
                                    break;

                                default:
                                    status = false, message = "error order type params childgame";
                                    break;
                            }

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                    } else {
                        status = false, message = "Bạn không đủ tiền";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé Keno!";
                }

                break;



            case 'power':
                const lastPowerRound = await LotteryModel.findOne({
                    where: {
                        type: "power"
                    },
                    order: [ [ 'id', 'DESC' ]],
                });
                console.log(lastPowerRound);
                status = true, message = lastPowerRound;


            break;




            default:
                status = true, message = "error order type params game";
                break;
        }

        res.json({ status, message });

    } catch (err) {
        console.log(err);
        res.json({
            status: false,
            msg: err.message
        });
    }
});



export default router;