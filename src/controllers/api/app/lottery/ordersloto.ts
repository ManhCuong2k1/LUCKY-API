import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import { getSettings } from "@models/LotterySettings";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { UserHistoryModel, UserHistoryAdd } from "@models/LotteryUserHistory";

import { UserModel } from "@models/User";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const router = Router();


router.post("/", async (req: Request, res: Response) => {

    try {

        const user: any = req.user;
        const body = req.body;
        let status = true, message, dataImport: any = null;

        switch (body.game) { // kiểm tra user order game nào
            case "compute123":

                const currentTime = moment();
                currentTime.set("hour", 18);
                currentTime.set("minute", 30);
                currentTime.set("second", 0);
                currentTime.set("millisecond", 0);
                const nowtime: any = moment();

                const isActiveOrder = helper.blockInPeriodTime(17, 30, 19);

                if (isActiveOrder) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();

                    if (nowtime.format("H") >= 19) {
                        timeOrder = currentTime.add(1, "d");
                    } else {
                        timeOrder = currentTime;
                    }

                    let roundOrder: any = moment(timeOrder).format("YYYYMMDD");// gán round hiện tại = ngày hôm nay
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));;

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.COMPUTE123,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Điện Toán 123",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if(i != 1) {
                                timeOrder = timeOrder.add(1, "d");
                                roundOrder = moment(timeOrder).format("YYYYMMDD");
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.COMPUTE123,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                finishTime: moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            status = true, message = "Đặt Vé Thành Công!";

                            (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Điện Toán 123 Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }

                break;


            case "compute636":

                const currentTime636: any = moment();
                const isActiveOrder636 = helper.blockInPeriodTime(17, 30, 19);

                if (isActiveOrder636) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);
                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.COMPUTE636,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Điện Toán 636",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);

                        let roundOrder;
                        let timeRunning: any;
                        let timeToday: any = moment();
                        timeToday.set("hour", 18);
                        timeToday.set("minute", 15);
                        timeToday.set("second", 0);
                        timeToday.set("millisecond", 0);

                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if (currentTime636.format("H") >= 19) {
                                timeToday = moment(timeToday).add(1, "d");
                                for (let i = 0; i <= 10; i++) {
                                    timeRunning = moment(timeToday).format("dddd");
                                    if (timeRunning == "Wednesday" || timeRunning == "Saturday") {
                                        roundOrder = moment(timeToday).format("YYYYMMDD");
                                        timeOrder = moment(timeToday).format("YYYY-MM-DD 18:15");
                                        timeToday = moment(timeToday).add(1, "d");
                                        break;
                                    } else {
                                        timeToday = moment(timeToday).add(1, "d");
                                    }
                                }
                            } else {
                                for (let i = 0; i <= 10; i++) {
                                    timeRunning = moment(timeToday).format("dddd");
                                    if (timeRunning == "Wednesday" || timeRunning == "Saturday") {
                                        roundOrder = moment(timeToday).format("YYYYMMDD");
                                        timeOrder = moment(timeToday).format("YYYY-MM-DD 18:15:0");
                                        timeToday = moment(timeToday).add(1, "d");
                                        break;
                                    } else {
                                        timeToday = moment(timeToday).add(1, "d");
                                    }
                                }
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.COMPUTE636,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + timeOrder,
                                finishTime: timeOrder,
                                moreDetail: "Đại lý giữ hộ vé"
                            };


                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Điện Toán 636 Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }
                break;


            case "loto234":

                const currentTimeLoto234: any = moment();
                currentTimeLoto234.set("hour", 18);
                currentTimeLoto234.set("minute", 30);
                currentTimeLoto234.set("second", 0);
                currentTimeLoto234.set("millisecond", 0);
                
                const isActiveOrderLoto234 = helper.blockInPeriodTime(17, 30, 19);

                if (isActiveOrderLoto234) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();
                    if (currentTimeLoto234.format("H") >= 19) {
                        timeOrder = currentTimeLoto234.add(1, "d");
                    } else {
                        timeOrder = currentTimeLoto234;
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.LOTO234,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Loto 234",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if(i != 1) {
                                timeOrder = timeOrder.add(1, "d");
                                roundOrder = moment(timeOrder).format("YYYYMMDD");
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.LOTO234,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                finishTime: moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                moreDetail: "Đại lý giữ hộ vé"
                            };
                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Loto 234 Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }
                break;



            case "loto2":

                const currentTimeLoto2: any = moment();
                currentTimeLoto2.set("hour", 18);
                currentTimeLoto2.set("minute", 30);
                currentTimeLoto2.set("second", 0);
                currentTimeLoto2.set("millisecond", 0);
                const nowtimeLoto2: any = moment();

                const isActiveOrderLoto2 = helper.blockInPeriodTime(17, 30, 19);


                if (isActiveOrderLoto2) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();
                    if (currentTimeLoto2.format("H") >= 19) {
                        timeOrder = currentTimeLoto2.add(1, "d");
                    } else {
                        timeOrder = currentTimeLoto2;
                    }

                    let roundOrder: any = moment(timeOrder).format("YYYYMMDD");// gán round hiện tại = ngày hôm nay
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.LOTO2,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Loto 2 Số",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if(i != 1) {
                                timeOrder = timeOrder.add(1, "d");
                                roundOrder = moment(timeOrder).format("YYYYMMDD");
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.LOTO2,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                finishTime: moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Loto 2 Số Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }
                break;

            case "loto3":
                const currentTimeLoto3: any = moment();
                currentTimeLoto3.set("hour", 18);
                currentTimeLoto3.set("minute", 30);
                currentTimeLoto3.set("second", 0);
                currentTimeLoto3.set("millisecond", 0);
                
                const isActiveOrderLoto3 = helper.blockInPeriodTime(17, 30, 19);


                if (isActiveOrderLoto3) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();
                    if (currentTimeLoto3.format("H") >= 19) {
                        timeOrder = currentTimeLoto3.add(1, "d");
                    } else {
                        timeOrder = currentTimeLoto3;
                    }

                    let roundOrder: any = moment(timeOrder).format("YYYYMMDD");// gán round hiện tại = ngày hôm nay
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.LOTO3,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Loto 3 Số",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if(i != 1) {
                                timeOrder = timeOrder.add(1, "d");
                                roundOrder = moment(timeOrder).format("YYYYMMDD");
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.LOTO3,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                finishTime: moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Loto 3 Số Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }
                break;


            case "loto5":
                const currentTimeLoto5: any = moment();
                currentTimeLoto5.set("hour", 18);
                currentTimeLoto5.set("minute", 30);
                currentTimeLoto5.set("second", 0);
                currentTimeLoto5.set("millisecond", 0);
                const nowtimeLoto5: any = moment();

                const isActiveOrderLoto5 = helper.blockInPeriodTime(17, 30, 19);

                if (isActiveOrderLoto5) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = moment();
                    if (nowtimeLoto5.format("H") >= 19) {
                        timeOrder = currentTimeLoto5.add(1, "d");
                    } else {
                        timeOrder = currentTimeLoto5;
                    }

                    let roundOrder: any = moment(timeOrder).format("YYYYMMDD");// gán round hiện tại = ngày hôm nay
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
                    fee = fee * Number(body.preriod);

                    const orderPrice = totalPrice; // tiền 1 đơn
                    totalPrice = (totalPrice * Number(body.preriod)) + fee; // tiền thanh toán khi đặt liên tiếp các kỳ

                    if (user.totalCoin >= totalPrice) { // kiểm tra tài khoản có đủ tiền hay không

                        const UserData = await UserModel.findOne({ where: { id: user.id } });
                        if (!UserData) throw new Error("Not found user");
                        UserData.totalCoin = UserData.totalCoin - totalPrice;
                        await UserData.save();
                        await UserData.reload();

                        const dataTicket: any = {
                            userId: user.id,
                            type: LotteryTicketModel.GAME_ENUM.LOTO5,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Loto 5 Số",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if(i != 1) {
                                timeOrder = timeOrder.add(1, "d");
                                roundOrder = moment(timeOrder).format("YYYYMMDD");
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.LOTO5,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                finishTime: moment(timeOrder).format("YYYY-MM-DD 18:15:00"),
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Loto 5 Số Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
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