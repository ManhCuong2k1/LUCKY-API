import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import LotteryHelper from "./helper";
import Crawl from "../../crawl/Crawl";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
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
                                        type: LotteryOrdersModel.GAME_ENUM.KENO,
                                        roundId: "00" + roundOrder,
                                        orderDetail: JSON.stringify({
                                            childgame: "basic",
                                            level: body.level,
                                            data: body.data,
                                            totalprice: orderPrice
                                        }),
                                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
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
                                        type: LotteryTicketModel.GAME_ENUM.KENO,
                                        roundId: "00" + roundOrder,
                                        orderDetail: JSON.stringify({
                                            childgame: "chanle_lonnho",
                                            data: body.data,
                                            totalprice: orderPrice
                                        }),
                                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
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
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPrice)+ " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé Keno!";
                }

                break;



            case "power":
                let priceOneList: number = 0;



                switch (body.level) {
                    case 5:
                        priceOneList = 500000;
                    break;
                    case 6:
                        priceOneList = 10000;
                    break;
                    case 7:
                        priceOneList = 70000;
                    break;
                    case 8:
                        priceOneList = 280000;
                    break;
                    case 9:
                        priceOneList = 840000;
                    break;
                    case 10:
                        priceOneList = 2100000;
                    break;
                    case 11:
                        priceOneList = 4620000;
                    break;
                    case 12:
                        priceOneList = 9240000;
                    break;
                    case 13:
                        priceOneList = 17160000;
                    break;
                    case 14:
                        priceOneList = 30030000;
                    break;
                    case 15:
                        priceOneList = 50050000;
                    break;
                    case 18:
                        priceOneList = 185640000;
                    break;
                }



                let totalPrice = 0;
                let fee = 0;

                body.data.forEach((data: any) => {
                    totalPrice = totalPrice + priceOneList;
                });

                fee = (fee * totalPrice) / 100;

                const orderPrice = totalPrice; // tiền 1 đơn
                totalPrice = (totalPrice * body.preriod.length) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ


                if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                    const UserData = await UserModel.findOne({ where: { id: user.id } });
                    if (!UserData) throw new Error("Not found user");
                    UserData.totalCoin = UserData.totalCoin - totalPrice;
                    await UserData.save();
                    await UserData.reload();


                    const dataTicket: any = {
                        userId: user.id,
                        type: LotteryTicketModel.GAME_ENUM.POWER,
                        preriod: body.preriod.length,
                        totalPrice: totalPrice,
                        orderDetail: "Mua Vé Số Power",
                        orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                        resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                        moreDetail: "Đại lý giữ hộ vé"
                    };
                    const creatTicket = await LotteryTicketModel.create(dataTicket);

                    const roundValidate = LotteryHelper.sortRounds(body.preriod);

                    roundValidate.forEach(async (preriod: any) => {

                        dataImport = {
                            ticketId: creatTicket.id,
                            userId: user.id,
                            type: LotteryOrdersModel.GAME_ENUM.POWER,
                            roundId: preriod.round,
                            orderDetail: JSON.stringify({
                                level: body.level,
                                data: body.data,
                                totalprice: orderPrice
                            }),
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            finishTime: helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            moreDetail: "Đại lý giữ hộ vé"
                        };

                        const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                        // trừ tiền truocứ khi order                                 
                    });

                    status = true, message = "Đặt Vé Thành Công!";

                } else {
                    status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPrice)+ " đ";
                }


            break;



            case "mega":
                let priceOneListMega: number = 0;

                switch (body.level) {
                    case 5:
                        priceOneListMega = 400000;
                    break;
                    case 6:
                        priceOneListMega = 10000;
                    break;
                    case 7:
                        priceOneListMega = 70000;
                    break;
                    case 8:
                        priceOneListMega = 280000;
                    break;
                    case 9:
                        priceOneListMega = 840000;
                    break;
                    case 10:
                        priceOneListMega = 2100000;
                    break;
                    case 11:
                        priceOneListMega = 4620000;
                    break;
                    case 12:
                        priceOneListMega = 9240000;
                    break;
                    case 13:
                        priceOneListMega = 17160000;
                    break;
                    case 14:
                        priceOneListMega = 30030000;
                    break;
                    case 15:
                        priceOneListMega = 50050000;
                    break;
                    case 18:
                        priceOneListMega = 185640000;
                    break;
                }

                
                let totalPriceMega = 0;
                let feeMega = 0;

                body.data.forEach((data: any) => {
                    totalPriceMega = totalPriceMega + priceOneListMega;
                });

                feeMega = (feeMega * totalPriceMega) / 100;

                const orderPriceMega = totalPriceMega; // tiền 1 đơn
                totalPriceMega = (totalPriceMega * body.preriod.length) + feeMega; // tiền thanh toán khi đặt liên tiếp các kỳ


                if (user.totalCoin >= totalPriceMega) { // kiểm tra tài khoản có đủ tiền hay không

                    const UserData = await UserModel.findOne({ where: { id: user.id } });
                    if (!UserData) throw new Error("Not found user");
                    UserData.totalCoin = UserData.totalCoin - totalPriceMega;
                    await UserData.save();
                    await UserData.reload();


                    const dataTicket: any = {
                        userId: user.id,
                        type: LotteryTicketModel.GAME_ENUM.MEGA,
                        preriod: body.preriod.length,
                        totalPrice: totalPriceMega,
                        orderDetail: "Mua Vé Số Mega",
                        orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                        resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                        moreDetail: "Đại lý giữ hộ vé"
                    };
                    const creatTicket = await LotteryTicketModel.create(dataTicket);

                    const roundValidate = LotteryHelper.sortRounds(body.preriod);

                    roundValidate.forEach(async (preriod: any) => {

                        dataImport = {
                            ticketId: creatTicket.id,
                            userId: user.id,
                            type: LotteryOrdersModel.GAME_ENUM.MEGA,
                            roundId: preriod.round,
                            orderDetail: JSON.stringify({
                                level: body.level,
                                data: body.data,
                                totalprice: orderPriceMega
                            }),
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            finishTime: helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            moreDetail: "Đại lý giữ hộ vé"
                        };

                        const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                        // trừ tiền truocứ khi order                                 
                    });

                    status = true, message = "Đặt Vé Thành Công!";

                } else {
                    status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPriceMega);
                }


            break;


            case "max3d":

                let totalPriceMax3d = 0;
                let feeMax3d = 0;

                body.data.forEach((data: any) => {
                    totalPriceMax3d = totalPriceMax3d + data.price;
                });

                feeMax3d = (feeMax3d * totalPriceMax3d) / 100;

                const orderPriceMax3d = totalPriceMax3d; // tiền 1 đơn
                totalPriceMax3d = (totalPriceMax3d * body.preriod.length) + feeMax3d; // tiền thanh toán khi đặt liên tiếp các kỳ


                if (user.totalCoin >= totalPriceMax3d) { // kiểm tra tài khoản có đủ tiền hay không

                    const UserData = await UserModel.findOne({ where: { id: user.id } });
                    if (!UserData) throw new Error("Not found user");
                    UserData.totalCoin = UserData.totalCoin - totalPriceMax3d;
                    await UserData.save();
                    await UserData.reload();


                    const dataTicket: any = {
                        userId: user.id,
                        type: LotteryTicketModel.GAME_ENUM.MAX3D,
                        preriod: body.preriod.length,
                        totalPrice: totalPriceMax3d,
                        orderDetail: "Mua Vé Số Max3D",
                        orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                        resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                        moreDetail: "Đại lý giữ hộ vé"
                    };
                    const creatTicket = await LotteryTicketModel.create(dataTicket);

                    const roundValidate = LotteryHelper.sortRounds(body.preriod);

                    roundValidate.forEach(async (preriod: any) => {

                        dataImport = {
                            ticketId: creatTicket.id,
                            userId: user.id,
                            type: LotteryOrdersModel.GAME_ENUM.MAX3D,
                            roundId: preriod.round,
                            orderDetail: JSON.stringify({
                                level: body.level,
                                data: body.data,
                                totalprice: orderPriceMax3d
                            }),
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            finishTime: helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            moreDetail: "Đại lý giữ hộ vé"
                        };

                        const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                        // trừ tiền truocứ khi order                                 
                    });

                    status = true, message = "Đặt Vé Thành Công!";

                } else {
                    status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPriceMax3d)+ " đ";
                }

            break;



            case "max3dplus":

                let totalPriceMax3dPlus = 0;
                let feeMax3dPlus = 0;

                body.data.forEach((data: any) => {
                    totalPriceMax3dPlus = totalPriceMax3dPlus + data.price;
                });

                feeMax3dPlus = (feeMax3dPlus * totalPriceMax3dPlus) / 100;

                const orderPriceMax3dPlus = totalPriceMax3dPlus; // tiền 1 đơn
                totalPriceMax3dPlus = (totalPriceMax3dPlus * body.preriod.length) + feeMax3dPlus; // tiền thanh toán khi đặt liên tiếp các kỳ


                if (user.totalCoin >= totalPriceMax3dPlus) { // kiểm tra tài khoản có đủ tiền hay không

                    const UserData = await UserModel.findOne({ where: { id: user.id } });
                    if (!UserData) throw new Error("Not found user");
                    UserData.totalCoin = UserData.totalCoin - totalPriceMax3dPlus;
                    await UserData.save();
                    await UserData.reload();


                    const dataTicket: any = {
                        userId: user.id,
                        type: LotteryTicketModel.GAME_ENUM.MAX3D,
                        preriod: body.preriod.length,
                        totalPrice: totalPriceMax3dPlus,
                        orderDetail: "Mua Vé Số Max3D",
                        orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                        resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                        moreDetail: "Đại lý giữ hộ vé"
                    };
                    const creatTicket = await LotteryTicketModel.create(dataTicket);


                    body.preriod.forEach(async (preriod: any) => {

                        dataImport = {
                            ticketId: creatTicket.id,
                            userId: user.id,
                            type: LotteryOrdersModel.GAME_ENUM.MAX3D,
                            roundId: preriod.round,
                            orderDetail: JSON.stringify({
                                level: body.level,
                                data: body.data,
                                totalprice: orderPriceMax3dPlus
                            }),
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            finishTime: helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            moreDetail: "Đại lý giữ hộ vé"
                        };

                        const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                        // trừ tiền truocứ khi order                                 
                    });

                    status = true, message = "Đặt Vé Thành Công!";

                } else {
                    status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPriceMax3dPlus)+ " đ";
                }

            break;


            case "max4d":

                let totalPriceMax4d = 0;
                let feeMax4d = 0;

                body.data.forEach((data: any) => {
                    totalPriceMax4d = totalPriceMax4d + data.price;
                });

                feeMax4d = (feeMax4d * totalPriceMax4d) / 100;

                const orderPriceMax4d = totalPriceMax4d; // tiền 1 đơn
                totalPriceMax4d = (totalPriceMax4d * body.preriod.length) + feeMax4d; // tiền thanh toán khi đặt liên tiếp các kỳ


                if (user.totalCoin >= totalPriceMax4d) { // kiểm tra tài khoản có đủ tiền hay không

                    const UserData = await UserModel.findOne({ where: { id: user.id } });
                    if (!UserData) throw new Error("Not found user");
                    UserData.totalCoin = UserData.totalCoin - totalPriceMax4d;
                    await UserData.save();
                    await UserData.reload();


                    const dataTicket: any = {
                        userId: user.id,
                        type: LotteryTicketModel.GAME_ENUM.MAX4D,
                        preriod: body.preriod.length,
                        totalPrice: totalPriceMax4d,
                        orderDetail: "Mua Vé Số Max4D",
                        orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                        resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                        moreDetail: "Đại lý giữ hộ vé"
                    };
                    const creatTicket = await LotteryTicketModel.create(dataTicket);


                    body.preriod.forEach(async (preriod: any) => {

                        dataImport = {
                            ticketId: creatTicket.id,
                            userId: user.id,
                            type: LotteryOrdersModel.GAME_ENUM.MAX4D,
                            roundId: preriod.round,
                            orderDetail: JSON.stringify({
                                childgame: body.childgame,
                                data: body.data,
                                totalprice: orderPriceMax4d
                            }),
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            finishTime: helper.addMinuteToTime(helper.timeConverter(preriod.time / 1000), 45),
                            moreDetail: "Đại lý giữ hộ vé"
                        };

                        const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                        // trừ tiền truocứ khi order                                 
                    });

                    status = true, message = "Đặt Vé Thành Công!";

                } else {
                    status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ "+ helper.numberformat(totalPriceMax4d)+ " đ";
                }

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