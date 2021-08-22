import helper from "@controllers/api/helper/helper";
import { LotteryOrdersModel, SymtemSetReward } from "@models/LotteryOrder";
import { UpdateTicketReward } from "@models/LotteryTicket";
import { UserHistoryModel, UserHistoryAdd } from "@models/LotteryUserHistory";
import { LotteryNotifyModel, UserNotifyAdd } from "@models/LotteryNotify";
import { LotteryResultsModel } from "@models/LotteryResults";
import LotteryHelper from "./helper";



const updateResultLoto = async (game: string, data: any) => {

    let status: boolean = true, message: any;

    switch (game) {
        case LotteryResultsModel.GAME_ENUM.KIENTHIET:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;
                    let capsonhan: number = 0;

                    for await (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            const numberOrder5so = number;
                            const giaiDb2so = data.result.giaidacbiet.slice(-2);
                            const numberOrder4so = number.slice(-4);
                            const numberOrder3so = number.slice(-3);
                            const numberOrder2so = number.slice(-2);

                            const isWinDB = (String(numberOrder5so) == data.result.giaidacbiet) ? true : false;
                            const isWinKk = (String(numberOrder2so) == giaiDb2so) ? true : false;
                            const isWinGN = (String(numberOrder5so) == data.result.giainhat) ? true : false;
                            const isWinGNhi = (LotteryHelper.countSame(String(numberOrder5so), data.result.giainhi) > 0) ? true : false;
                            const isWinGBa = (LotteryHelper.countSame(String(numberOrder5so), data.result.giaiba) > 0) ? true : false;
                            const isWinGT = (LotteryHelper.countSame(String(numberOrder4so), data.result.giaitu) > 0) ? true : false;
                            const isWinGNam = (LotteryHelper.countSame(String(numberOrder4so), data.result.giainam) > 0) ? true : false;
                            const isWinGS = (LotteryHelper.countSame(String(numberOrder3so), data.result.giaisau) > 0) ? true : false;
                            const isWinGBay = (LotteryHelper.countSame(String(numberOrder2so), data.result.giaibay) > 0) ? true : false;

                            if(isWinDB == true) {
                                capsonhan = 20000;
                            }else if(isWinGN == true) {
                                capsonhan = 2000;
                            }else if(isWinGNhi == true) {
                                capsonhan = 500;
                            }else if(isWinGBa == true) {
                                capsonhan = 200;
                            }else if(isWinGT == true) {
                                capsonhan = 40;
                            }else if(isWinGNam == true) {
                                capsonhan = 20;
                            }else if(isWinGS == true) {
                                capsonhan = 10;
                            }else if(isWinGBay == true) {
                                capsonhan = 4;
                            }else if(isWinKk == true) {
                                capsonhan = 4;
                            }else {
                                capsonhan = 0;
                            }

                            const reward = (10000 * capsonhan) * i.total;
                            if (reward > 0) updateReward = updateReward + reward;
                            if (reward > 0) isWin = true;

                            if (isWin == true) {
                                (isWinDB == true) ? dataNumber.push(number) : "";
                                (isWinGN == true) ? dataNumber.push(number) : "";
                                (isWinGNhi == true) ? dataNumber.push(number) : "";
                                (isWinGBa == true) ? dataNumber.push(number) : "";
                                (isWinGT == true) ? dataNumber.push(number) : "";
                                (isWinGNam == true) ? dataNumber.push(number) : "";
                                (isWinGS == true) ? dataNumber.push(number) : "";
                                (isWinGBay == true) ? dataNumber.push(number) : "";
                                (isWinKk == true) ? dataNumber.push(number) : "";

                                if (dataNumber.length > 0) {
                                    dataUpdate["data"].push({
                                        number: dataNumber,
                                        reward: reward
                                    });
                                }
                            }

                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.KIENTHIET,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.KIENTHIET,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Kiến Thiết " + orderData.ticketId + "."
                        );
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }
            break;


        case LotteryResultsModel.GAME_ENUM.COMPUTE636:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {

                        try {
                            const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                            const arrResult = LotteryHelper.arrayStringToNumber(data.result);
                            const checkSame = LotteryHelper.checkSame(arrBet, arrResult);
                            const reward = LotteryHelper.getRewardCompute636(checkSame.length);
                            dataUpdate["data"].push({
                                number: checkSame,
                                reward: reward
                            });
                            if (reward > 0) {
                                isWin = true;
                                updateReward = updateReward + reward;
                            }
                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.COMPUTE636,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.COMPUTE636,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Điện Toán 6x36 " + orderData.ticketId + "."
                        );
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }
            break;

        case LotteryResultsModel.GAME_ENUM.COMPUTE123:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;
                    let isWinNum1: boolean = false, isWinNum2: boolean = false, isWinNum3: boolean = false;
                    let capsonhan: number = 0;

                    for await (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            // Bo so thu 1
                            isWinNum1 = (Number(number[0]) == Number(data.result[0])) ? true : false;
                            isWinNum2 = (Number(number[1]) == Number(data.result[1])) ? true : false;
                            isWinNum3 = (Number(number[2]) == Number(data.result[2])) ? true : false;

                            if (isWinNum1 == true || isWinNum2 == true || isWinNum3 == true) isWin = true;

                            if (isWin == true) {
                                if (isWinNum1 == true && isWinNum2 == true && isWinNum3 == true) {
                                    capsonhan = 40000;
                                } else if (isWinNum2 == true && isWinNum3 == true) {
                                    capsonhan = 6000;
                                } else if (isWinNum1 == true && isWinNum3 == true) {
                                    capsonhan = 500;
                                } else if (isWinNum3 == true) {
                                    capsonhan = 100;
                                } else if (isWinNum1 == true && isWinNum2 == true) {
                                    capsonhan = 100;
                                } else if (isWinNum2 == true) {
                                    capsonhan = 5;
                                } else if (isWinNum1 == true) {
                                    capsonhan = 1;
                                } else {
                                    capsonhan = 0;
                                }
                            }

                            const reward = Number(i.price) * capsonhan;
                            if (reward > 0) updateReward = updateReward + reward;

                            if (isWin == true) {
                                (isWinNum1 == true) ? dataNumber.push(number[0]) : "";
                                (isWinNum2 == true) ? dataNumber.push(number[1]) : "";
                                (isWinNum3 == true) ? dataNumber.push(number[2]) : "";
                                if (dataNumber.length > 0) {
                                    dataUpdate["data"].push({
                                        number: dataNumber,
                                        reward: reward
                                    });
                                }
                            }

                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.COMPUTE123,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.COMPUTE123,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Điện Toán 123 " + orderData.ticketId + "."
                        );
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }
            break;


        case LotteryResultsModel.GAME_ENUM.LOTO2:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;
                    let isWinDB: boolean = false, isWinGN: boolean = false;
                    let capsonhan: number = 0;

                    for await (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            const numberOrder = number[0] + number[1];

                            const giaidb = data.result.giaidacbiet.slice(-2);
                            const giainhat = data.result.giainhat.slice(-2);

                            isWinDB = (numberOrder == giaidb) ? true : false;
                            isWinGN = (numberOrder == giainhat) ? true : false;

                            if (isWinDB == true || isWinGN == true) isWin = true;

                            if (isWin == true) {
                                if (isWinDB == true && isWinGN) {
                                    capsonhan = 71;
                                } else if (isWinDB == true) {
                                    capsonhan = 70;
                                } else if (isWinGN == true) {
                                    capsonhan = 1;
                                } else {
                                    capsonhan = 0;
                                }
                            }


                            const reward = Number(i.price) * capsonhan;

                            if (reward > 0) updateReward = updateReward + reward;

                            if (isWin == true) {
                                if (reward > 0) {
                                    dataNumber.push(number[0]);
                                    dataNumber.push(number[1]);

                                    if (dataNumber.length > 0) {
                                        dataUpdate["data"].push({
                                            number: dataNumber,
                                            reward: reward
                                        });
                                    }
                                }
                            }

                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO2,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO2,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 2 Số " + orderData.ticketId + "."
                        );
                    }

                });       

            } catch (error) {
                status = false, message = error.message;
            }

            break;


        case LotteryResultsModel.GAME_ENUM.LOTO3:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;
                    let isWin3soDB: boolean = false, isWin3soGN: boolean = false,
                        isWin2soDB: boolean = false, isWin2soGN: boolean = false, isWinGiaisau: boolean = false;
                    let capsonhan: number = 0;

                    for await (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            const numberOrder3so = number[0] + number[1] + number[2];
                            const numberOrder2so = number[1] + number[2];

                            const giaidb3so = data.result.giaidacbiet.slice(-3);
                            const giainhat3so = data.result.giainhat.slice(-3);
                            const giaidb2so = data.result.giaidacbiet.slice(-2);
                            const giainhat2so = data.result.giainhat.slice(-2);
                            const giaisau = data.result.giaisau;


                            isWin3soDB = (numberOrder3so == giaidb3so) ? true : false;
                            isWin3soGN = (numberOrder3so == giainhat3so) ? true : false;
                            isWin2soDB = (numberOrder2so == giaidb2so) ? true : false;
                            isWin2soGN = (numberOrder2so == giainhat2so) ? true : false;
                            isWinGiaisau = (giaisau.indexOf(String(numberOrder3so)) > -1) ? true : false;

                            if (isWin3soDB == true && isWin3soGN) {
                                capsonhan = 440;
                            } else
                                if (isWin3soDB == true && isWinGiaisau) {
                                    capsonhan = 425;
                                } else
                                    if (isWin3soDB == true) {
                                        capsonhan = 420;
                                    } else
                                        if (isWin2soDB == true && isWin3soGN == true && isWinGiaisau) {
                                            capsonhan = 30;
                                        } else
                                            if (isWin3soGN == true && isWin2soDB) {
                                                capsonhan = 25;
                                            } else
                                                if (isWin3soGN == true && isWinGiaisau) {
                                                    capsonhan = 25;
                                                } else
                                                    if (isWin3soGN == true) {
                                                        capsonhan = 20;
                                                    } else
                                                        if (isWin2soDB == true) {
                                                            capsonhan = 5;
                                                        } else
                                                            if (isWinGiaisau == true) {
                                                                capsonhan = 5;
                                                            } else {
                                                                capsonhan = 0;
                                                            }

                            if (capsonhan > 0) isWin = true;
                            const reward = Number(i.price) * capsonhan;
                            if (reward > 0) updateReward = updateReward + reward;

                            if (isWin == true) {
                                if (reward > 0) {
                                    dataNumber.push(number[0]);
                                    dataNumber.push(number[1]);
                                    dataNumber.push(number[2]);

                                    if (dataNumber.length > 0) {
                                        dataUpdate["data"].push({
                                            number: dataNumber,
                                            reward: reward
                                        });
                                    }
                                }
                            }

                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO3,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO3,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 3 Số " + orderData.ticketId + "."
                        );
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }

            break;

        case LotteryResultsModel.GAME_ENUM.LOTO5:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;
                    let isWinDB: boolean = false, isWinGN: boolean = false, isWinGNhi: boolean = false,
                        isWinGBa: boolean = false, isWinGT: boolean = false, isWinGNam: boolean = false,
                        isWinGS: boolean = false, isWinGBay: boolean = false, isWinKk: boolean = false;
                    let capsonhan: number = 0;

                    for await (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            const numberOrder5so = number[0] + number[1] + number[2] + number[3] + number[4];
                            const numberOrder4so = number[0] + number[1] + number[2] + number[3];
                            const numberOrder3so = number[0] + number[1] + number[2];
                            const numberOrder2so = number[1] + number[2];

                            const giaidb = data.result.giaidacbiet; // 1
                            const giaidb2so = data.result.giaidacbiet.slice(-2); // 1
                            const giainhat = data.result.giainhat; // 1
                            const giainhi = data.result.giainhi; // 2
                            const giaiba = data.result.giaiba; // 6
                            const giaitu = data.result.giaitu; // 4
                            const giainam = data.result.giainam; // 6
                            const giaisau = data.result.giaisau; // 3 
                            const giaibay = data.result.giaibay; // 4


                            isWinDB = (numberOrder5so == giaidb) ? true : false;
                            isWinGN = (numberOrder5so == giainhat) ? true : false;
                            isWinGNhi = (giainhi.indexOf(String(numberOrder5so)) > -1) ? true : false;
                            isWinGBa = (giaiba.indexOf(String(numberOrder5so)) > -1) ? true : false;
                            isWinGT = (giaitu.indexOf(String(numberOrder4so)) > -1) ? true : false;
                            isWinGNam = (giainam.indexOf(String(numberOrder4so)) > -1) ? true : false;
                            isWinGS = (giaisau.indexOf(String(numberOrder3so)) > -1) ? true : false;
                            isWinGBay = (giaibay.indexOf(String(numberOrder2so)) > -1) ? true : false;
                            isWinKk = (numberOrder2so == giaidb2so) ? true : false;


                            if (isWinDB == true) {
                                capsonhan = 20000;
                            } else
                                if (isWinGN == true) {
                                    capsonhan = 2000;
                                } else
                                    if (isWinGNhi == true) {
                                        capsonhan = 500;
                                    } else
                                        if (isWinGBa == true) {
                                            capsonhan = 200;
                                        } else
                                            if (isWinGT == true) {
                                                capsonhan = 40;
                                            } else
                                                if (isWinGNam == true) {
                                                    capsonhan = 20;
                                                } else
                                                    if (isWinGS == true) {
                                                        capsonhan = 10;
                                                    } else
                                                        if (isWinGBay == true) {
                                                            capsonhan = 4;
                                                        } else
                                                            if (isWinKk == true) {
                                                                capsonhan = 4;
                                                            } else {
                                                                capsonhan = 0;
                                                            }


                            if (capsonhan > 0) isWin = true;
                            const reward = Number(i.price) * capsonhan;
                            if (reward > 0) updateReward = updateReward + reward;

                            if (isWin == true) {
                                if (reward > 0) {
                                    dataNumber.push(number[0]);
                                    dataNumber.push(number[1]);
                                    dataNumber.push(number[2]);
                                    dataNumber.push(number[3]);
                                    dataNumber.push(number[4]);
                                    if (dataNumber.length > 0) {
                                        dataUpdate["data"].push({
                                            number: dataNumber,
                                            reward: reward
                                        });
                                    }
                                }
                            }

                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        UserNotifyAdd(
                            orderUpdate.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO5,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO5,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 5 Số " + orderData.ticketId + "."
                        );
                    }

                });
            } catch (error) {
                status = false, message = error.message;
            }

            break;

        case LotteryResultsModel.GAME_ENUM.LOTO234:
            try {
                let dataUpdate: any = null;
                const processLoto2 = async (item: any) => {
                    try {
                        const orderDetail = JSON.parse(item.orderDetail);
                        dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                        let isWin: boolean = false, updateReward: number = 0;
                        let capsonhan: number = 0;


                        for await (const i of orderDetail.data) {
                            try {
                                const dataNumber: any[] = [];
                                const number = i.number;
                                const countNumber1 = LotteryHelper.countSame(number[0], data.result);
                                const countNumber2 = LotteryHelper.countSame(number[1], data.result);

                                if (countNumber1 >= 2 && countNumber2 >= 2) {
                                    capsonhan = 15;
                                } else if (countNumber1 >= 1 && countNumber2 >= 1) {
                                    capsonhan = 10;
                                } else if (countNumber1 >= 2 || countNumber2 >= 2) {
                                    capsonhan = 1;
                                } else {
                                    capsonhan = 0;
                                }

                                if (capsonhan > 0) isWin = true;
                                const reward = Number(i.price) * capsonhan;
                                if (reward > 0) updateReward = updateReward + reward;

                                if (isWin == true) {
                                    if (reward > 0) {
                                        dataNumber.push(number[0]);
                                        dataNumber.push(number[1]);
                                        if (dataNumber.length > 0) {
                                            dataUpdate["data"].push({
                                                number: dataNumber,
                                                reward: reward
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.log(error.message);
                            }
                        }

                        if (isWin) await SymtemSetReward(item.id, item.userId, updateReward);
                        await UpdateTicketReward(item.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                        dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                        const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: item.id } });
                        orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                        orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                        orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                        await orderUpdate.save();
                        await orderUpdate.reload();

                        if (isWin) {
                            UserNotifyAdd(
                                orderUpdate.userId,
                                LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO234,
                                LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO234,
                                "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + item.ticketId + "."
                            );
                            UserHistoryAdd(
                                item.userId,
                                UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                                UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                                "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 2 Cặp Số " + item.ticketId + "."
                            );
                        }

                    } catch (err) {
                        console.log(err.message);
                    }
                };

                const processLoto3 = async (item: any) => {
                    try {
                        let dataUpdate: any = null;
                        const orderDetail = JSON.parse(item.orderDetail);
                        dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                        let isWin: boolean = false, updateReward: number = 0;
                        let capsonhan: number = 0;


                        for await (const i of orderDetail.data) {
                            try {
                                const dataNumber: any[] = [];
                                const number = i.number;
                                const countNumber1 = LotteryHelper.countSame(number[0], data.result);
                                const countNumber2 = LotteryHelper.countSame(number[1], data.result);
                                const countNumber3 = LotteryHelper.countSame(number[2], data.result);

                                if (countNumber1 >= 2 && countNumber2 >= 2 && countNumber3 >= 2) {
                                    capsonhan = 60;
                                } else if (countNumber1 >= 1 && countNumber2 >= 1 && countNumber3 >= 1) {
                                    capsonhan = 45;
                                } else if (
                                    countNumber1 >= 2 && countNumber2 >= 2 ||
                                    countNumber1 >= 2 && countNumber3 >= 2 ||
                                    countNumber2 >= 2 && countNumber1 >= 2 ||
                                    countNumber2 >= 2 && countNumber3 >= 2 ||
                                    countNumber3 >= 2 && countNumber1 >= 2 ||
                                    countNumber3 >= 2 && countNumber2 >= 2
                                ) {
                                    capsonhan = 10;
                                } else if (
                                    countNumber1 >= 1 && countNumber2 >= 2 ||
                                    countNumber1 >= 1 && countNumber3 >= 2 ||
                                    countNumber2 >= 1 && countNumber1 >= 2 ||
                                    countNumber2 >= 1 && countNumber3 >= 2 ||
                                    countNumber3 >= 1 && countNumber1 >= 2 ||
                                    countNumber3 >= 1 && countNumber2 >= 2
                                ) {
                                    capsonhan = 2;
                                } else {
                                    capsonhan = 0;
                                }

                                if (capsonhan > 0) isWin = true;
                                const reward = Number(i.price) * capsonhan;
                                if (reward > 0) updateReward = updateReward + reward;

                                if (isWin == true) {
                                    if (reward > 0) {
                                        dataNumber.push(number[0]);
                                        dataNumber.push(number[1]);
                                        dataNumber.push(number[2]);
                                        if (dataNumber.length > 0) {
                                            dataUpdate["data"].push({
                                                number: dataNumber,
                                                reward: reward
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.log(error.message);
                            }
                        }

                        if (isWin) await SymtemSetReward(item.id, item.userId, updateReward);
                        await UpdateTicketReward(item.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                        dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                        const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: item.id } });
                        orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                        orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                        orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                        await orderUpdate.save();
                        await orderUpdate.reload();

                        if (isWin) {
                            UserNotifyAdd(
                                orderUpdate.userId,
                                LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO234,
                                LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO234,
                                "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + item.ticketId + "."
                            );
                            UserHistoryAdd(
                                item.userId,
                                UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                                UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                                "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 3 Cặp Số " + item.ticketId + "."
                            );
                        }
                    } catch (err) {
                        console.log(err.message);
                    }
                };

                const processLoto4 = async (item: any) => {
                    try {
                        let dataUpdate: any = null;
                        const orderDetail = JSON.parse(item.orderDetail);
                        dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                        let isWin: boolean = false, updateReward: number = 0;
                        let capsonhan: number = 0;


                        for await (const i of orderDetail.data) {
                            try {
                                const dataNumber: any[] = [];
                                const number = i.number;
                                const countNumber1 = LotteryHelper.countSame(number[0], data.result);
                                const countNumber2 = LotteryHelper.countSame(number[1], data.result);
                                const countNumber3 = LotteryHelper.countSame(number[2], data.result);
                                const countNumber4 = LotteryHelper.countSame(number[3], data.result);

                                if (countNumber1 >= 2 && countNumber2 >= 2 && countNumber3 >= 2 && countNumber4 >= 2) {
                                    capsonhan = 1000;
                                } else if (countNumber1 >= 1 && countNumber2 >= 1 && countNumber3 >= 1 && countNumber4 >= 1) {
                                    capsonhan = 110;
                                } else if (
                                    countNumber1 >= 2 && countNumber2 >= 2 && countNumber3 >= 2 ||
                                    countNumber1 >= 2 && countNumber2 >= 2 && countNumber4 >= 2 ||
                                    countNumber1 >= 2 && countNumber3 >= 2 && countNumber2 >= 2 ||
                                    countNumber1 >= 2 && countNumber3 >= 2 && countNumber4 >= 2 ||
                                    countNumber1 >= 2 && countNumber4 >= 2 && countNumber2 >= 2 ||
                                    countNumber1 >= 2 && countNumber4 >= 2 && countNumber3 >= 2
                                ) {
                                    capsonhan = 30;
                                } else if (
                                    countNumber1 >= 1 && countNumber2 >= 2 && countNumber3 >= 2 ||
                                    countNumber1 >= 1 && countNumber2 >= 2 && countNumber4 >= 2 ||
                                    countNumber1 >= 1 && countNumber3 >= 2 && countNumber2 >= 2 ||
                                    countNumber1 >= 1 && countNumber3 >= 2 && countNumber4 >= 2 ||
                                    countNumber1 >= 1 && countNumber4 >= 2 && countNumber2 >= 2 ||
                                    countNumber1 >= 1 && countNumber4 >= 2 && countNumber3 >= 2 ||
                                    countNumber1 >= 2 && countNumber2 >= 1 && countNumber3 >= 2 ||
                                    countNumber1 >= 2 && countNumber2 >= 1 && countNumber4 >= 2 ||
                                    countNumber1 >= 2 && countNumber3 >= 1 && countNumber2 >= 2 ||
                                    countNumber1 >= 2 && countNumber3 >= 1 && countNumber4 >= 2 ||
                                    countNumber1 >= 2 && countNumber4 >= 1 && countNumber2 >= 2 ||
                                    countNumber1 >= 2 && countNumber4 >= 1 && countNumber3 >= 2 ||
                                    countNumber1 >= 2 && countNumber2 >= 2 && countNumber3 >= 1 ||
                                    countNumber1 >= 2 && countNumber2 >= 2 && countNumber4 >= 1 ||
                                    countNumber1 >= 2 && countNumber3 >= 2 && countNumber2 >= 1 ||
                                    countNumber1 >= 2 && countNumber3 >= 2 && countNumber4 >= 1 ||
                                    countNumber1 >= 2 && countNumber4 >= 2 && countNumber2 >= 1 ||
                                    countNumber1 >= 2 && countNumber4 >= 2 && countNumber3 >= 1
                                ) {
                                    capsonhan = 15;
                                } else if(
                                    countNumber1 >= 1 && countNumber2 >= 1 && countNumber3 >= 2 ||
                                    countNumber1 >= 1 && countNumber2 >= 1 && countNumber4 >= 2 ||
                                    countNumber1 >= 1 && countNumber3 >= 1 && countNumber2 >= 2 ||
                                    countNumber1 >= 1 && countNumber3 >= 1 && countNumber4 >= 2 ||
                                    countNumber1 >= 1 && countNumber4 >= 1 && countNumber2 >= 2 ||
                                    countNumber1 >= 1 && countNumber4 >= 1 && countNumber3 >= 2 ||
                                    countNumber1 >= 2 && countNumber2 >= 1 && countNumber3 >= 1 ||
                                    countNumber1 >= 2 && countNumber2 >= 1 && countNumber4 >= 1 ||
                                    countNumber1 >= 2 && countNumber3 >= 1 && countNumber2 >= 1 ||
                                    countNumber1 >= 2 && countNumber3 >= 1 && countNumber4 >= 1 ||
                                    countNumber1 >= 2 && countNumber4 >= 1 && countNumber2 >= 1 ||
                                    countNumber1 >= 2 && countNumber4 >= 1 && countNumber3 >= 1 ||
                                    countNumber1 >= 1 && countNumber2 >= 2 && countNumber3 >= 1 ||
                                    countNumber1 >= 1 && countNumber2 >= 2 && countNumber4 >= 1 ||
                                    countNumber1 >= 1 && countNumber3 >= 2 && countNumber2 >= 1 ||
                                    countNumber1 >= 1 && countNumber3 >= 2 && countNumber4 >= 1 ||
                                    countNumber1 >= 1 && countNumber4 >= 2 && countNumber2 >= 1 ||
                                    countNumber1 >= 1 && countNumber4 >= 2 && countNumber3 >= 1
                                ) {
                                    capsonhan = 5;
                                } else {
                                    capsonhan = 0;
                                }

                                if (capsonhan > 0) isWin = true;
                                const reward = Number(i.price) * capsonhan;
                                if (reward > 0) updateReward = updateReward + reward;

                                if (isWin == true) {
                                    if (reward > 0) {
                                        dataNumber.push(number[0]);
                                        dataNumber.push(number[1]);
                                        dataNumber.push(number[2]);
                                        dataNumber.push(number[3]);
                                        if (dataNumber.length > 0) {
                                            dataUpdate["data"].push({
                                                number: dataNumber,
                                                reward: reward
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.log(error.message);
                            }
                        }

                        if (isWin) await SymtemSetReward(item.id, item.userId, updateReward);
                        await UpdateTicketReward(item.ticketId, updateReward); // cộng vào tổng thưởng của ticket
                        dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;
                        const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: item.id } });
                        orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                        orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                        orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                        await orderUpdate.save();
                        await orderUpdate.reload();

                        if (isWin) {
                            UserNotifyAdd(
                                orderUpdate.userId,
                                LotteryNotifyModel.NOTIFY_SLUG_ENUM.LOTO234,
                                LotteryNotifyModel.NOTIFY_NAME_ENUM.LOTO234,
                                "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + item.ticketId + "."
                            );
                            UserHistoryAdd(
                                item.userId,
                                UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                                UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                                "Trúng " + helper.numberformat(updateReward) + "đ vé Loto 4 Cặp Số " + item.ticketId + "."
                            );
                        }
                    } catch (err) {
                        console.log(err.message);
                    }
                };



                const findAllItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                findAllItem.forEach(async (item: any) => {
                    try {
                        const ObjItem = JSON.parse(item.orderDetail);
                        (Number(ObjItem.level == 2)) ? await processLoto2(item) : "";
                        (Number(ObjItem.level == 3)) ? await processLoto3(item) : "";
                        (Number(ObjItem.level == 4)) ? await processLoto4(item) : "";
                    } catch (error) {
                        console.log(error.message);
                    }
                });

            } catch (error) {
                status = false, message = error.message;
            }

            break;

        default:
            status = false, message = "error game params";
            break;

    }
    return { status, message };
};

export default {
    updateResultLoto
};
