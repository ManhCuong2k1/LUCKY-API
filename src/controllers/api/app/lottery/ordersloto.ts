import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import LotteryHelper from "./helper";
import Crawl from "../../crawl/Crawl";
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
                const isActiveOrder = (nowtime.format("H") != 18) ? true : false;


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
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
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

                const currentTime636 = helper.getTime(helper.timeStamp());
                const isActiveOrder636 = (currentTime636.getHours() != 18) ? true : false;

                if (isActiveOrder636) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;
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
                        let timeToday: any = moment().tz("Asia/Ho_Chi_Minh");

                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if (currentTime636.getHours() >= 19) {
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



            case "godofwealth":

                const currentTimeThanTai = helper.getTime(helper.timeStamp());
                const isActiveOrderThanTai = (currentTimeThanTai.getHours() != 18) ? true : false;

                if (isActiveOrderThanTai) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();

                    if (currentTimeThanTai.getHours() >= 19) {
                        timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
                    } else {
                        timeOrder = helper.timeConverter(timeOrder);
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;

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
                            type: LotteryTicketModel.GAME_ENUM.THANTAI4,
                            preriod: Number(body.preriod),
                            totalPrice: totalPrice,
                            orderDetail: "Mua Vé Số Thần Tài 4",
                            orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY,
                            resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DELAY,
                            moreDetail: "Đại lý giữ hộ vé"
                        };
                        const creatTicket = await LotteryTicketModel.create(dataTicket);


                        // order
                        for (let i = 1; i <= Number(body.preriod); i++) {

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 1440);
                                roundOrder = helper.timeConverterNoChar(timeOrder);
                            }

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.THANTAI4,
                                roundId: roundOrder,
                                orderDetail: JSON.stringify({
                                    level: body.level,
                                    data: body.data,
                                    totalprice: orderPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            isFirst = false;
                            status = true, message = "Đặt Vé Thành Công!";

                            const dbExecQuery = (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";
                            // trừ tiền truocứ khi order 

                        }

                        (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Thần Tài 4 Hết " + helper.numberformat(totalPrice) + " VND") : "";


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPrice) + " đ";
                    }

                } else {
                    status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
                }
                break;




            case "loto234":

                const currentTimeLoto234 = helper.getTime(helper.timeStamp());
                const isActiveOrderLoto234 = (currentTimeLoto234.getHours() != 18) ? true : false;

                if (isActiveOrderLoto234) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();

                    if (currentTimeLoto234.getHours() >= 19) {
                        timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
                    } else {
                        timeOrder = helper.timeConverter(timeOrder);
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;

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

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 1440);
                                roundOrder = helper.timeConverterNoChar(timeOrder);
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
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            isFirst = false;
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

                const currentTimeLoto2 = helper.getTime(helper.timeStamp());
                const isActiveOrderLoto2 = (currentTimeLoto2.getHours() != 18) ? true : false;

                if (isActiveOrderLoto2) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();

                    if (currentTimeLoto2.getHours() >= 19) {
                        timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
                    } else {
                        timeOrder = helper.timeConverter(timeOrder);
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;

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

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 1440);
                                roundOrder = helper.timeConverterNoChar(timeOrder);
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
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            isFirst = false;
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

                const currentTimeLoto3 = helper.getTime(helper.timeStamp());
                const isActiveOrderLoto3 = (currentTimeLoto3.getHours() != 18) ? true : false;

                if (isActiveOrderLoto3) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();

                    if (currentTimeLoto3.getHours() >= 19) {
                        timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
                    } else {
                        timeOrder = helper.timeConverter(timeOrder);
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });

                    fee = (fee * totalPrice) / 100;

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

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 1440);
                                roundOrder = helper.timeConverterNoChar(timeOrder);
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
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            isFirst = false;
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

                const currentTimeLoto5 = helper.getTime(helper.timeStamp());
                const isActiveOrderLoto5 = (currentTimeLoto5.getHours() != 18) ? true : false;

                if (isActiveOrderLoto5) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

                    let timeOrder: any = helper.timeStamp();

                    if (currentTimeLoto5.getHours() >= 19) {
                        timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
                    } else {
                        timeOrder = helper.timeConverter(timeOrder);
                    }

                    let roundOrder: any = helper.timeConverterNoChar(timeOrder);// gán round hiện tại = ngày hôm nay
                    let isFirst = true;
                    let totalPrice = 0;
                    let fee = Number(await getSettings("ticket_storage_fee"));

                    // tính tiền 1 đơn
                    body.data.forEach((data: any) => {
                        totalPrice = totalPrice + data.price;
                    });


                    fee = (fee * totalPrice) / 100;

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

                            if (isFirst == false) {
                                timeOrder = helper.addMinuteToTime(timeOrder, 1440);
                                roundOrder = helper.timeConverterNoChar(timeOrder);
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
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };

                            isFirst = false;
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