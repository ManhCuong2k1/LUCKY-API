import helper from "@controllers/api/helper/helper";
import { LotteryOrdersModel, getRewardReceived, UpdateUserReceived, UpdateUserCustody, SymtemSetReward } from "@models/LotteryOrder";
import { LotteryTicketModel, UpdateTicketReward } from "@models/LotteryTicket";
import { UserHistoryModel, UserHistoryAdd } from "@models/LotteryUserHistory";
import { LotteryNotifyModel, UserNotifyAdd } from "@models/LotteryNotify";
import { UserModel, UpdateUserReward } from "@models/User";
import { LotteryResultsModel } from "@models/LotteryResults";
import LotteryHelper from "./helper";



const updateResultLoto = async (game: string, data: any) => {

    let status: boolean = true, message: any, dataUpdate: any = null;

    switch (game) {
        case LotteryResultsModel.GAME_ENUM.KIENTHIET:
            try {


            } catch (error) {
                status = false, message = error.message;
            }
            break;


        case LotteryResultsModel.GAME_ENUM.COMPUTE636:
            try {

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

                    for (const i of orderDetail.data) {

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
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Keno " + orderData.ticketId + "."
                        );
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }
            break;

        case LotteryResultsModel.GAME_ENUM.COMPUTE123:
            try {
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

                    for (const i of orderDetail.data) {
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

                    for (const i of orderDetail.data) {
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

                    for (const i of orderDetail.data) {
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

                    for (const i of orderDetail.data) {
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
                
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                console.log(OrderItem);




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
