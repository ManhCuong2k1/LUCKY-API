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
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.KENO,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.KENO,
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
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.KENO,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.KENO,
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
                    const isWin: boolean = false, updateReward: number = 0;
                    const isWinDB: boolean = false, isWinGN: boolean = false;
                    const capsonhan: number = 0;

                    for (const i of orderDetail.data) {
                        try {
                            const dataNumber: any[] = [];
                            const number = i.number;
                            const numberOrder = number[0] + number[1] + number[2];

                            const giaidb = data.result.giaidacbiet.slice(-3);
                            const giainhat = data.result.giainhat.slice(-3);
                            const giaisau = data.result.giaisau;


                            console.log(giaisau);


                            
                        } catch (error) {
                            console.log(error.message);
                        }
                    }

                });

            } catch (error) {
                status = false, message = error.message;
            }

            break;

        case "":
            try {
            } catch (error) {
                status = false, message = error.message;
            }

            break;

        case "":
            try {
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
