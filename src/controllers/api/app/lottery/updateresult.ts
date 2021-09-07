import helper from "@controllers/api/helper/helper";
import { LotteryOrdersModel, SymtemSetReward } from "@models/LotteryOrder";
import { UpdateTicketReward } from "@models/LotteryTicket";
import { LotteryNotifyModel, UserNotifyAdd, PushNotify, NotifyWhenLimitReward } from "@models/LotteryNotify";
import { LotteryResultsModel } from "@models/LotteryResults";
import LotteryHelper from "./helper";

const updateResult = async (game: string, data: any) => {

    let status: boolean = true, message: any;


    switch (game) {
        case LotteryResultsModel.GAME_ENUM.KENO:
            try {
                let dataUpdate: any = null, dataUpdateChanLe: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                for (const orderData of OrderItem) {
                    const orderDetail = JSON.parse(orderData.orderDetail);

                    switch (orderDetail.childgame) {

                        // ĐẶT SỐ TRUYỀN THỐNG KENO
                        case "basic":
                            try {

                                dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                                let isWin: boolean = false, updateReward: number = 0;


                                for await (const i of orderDetail.data) {

                                    const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                                    const arrResult = LotteryHelper.arrayStringToNumber(data.result);

                                    const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                                    let reward = LotteryHelper.getRewardKeno(arrBet.length, checkSame.length);
                                    reward = reward * (i.price / 10000);

                                    dataUpdate["data"].push({
                                        number: checkSame,
                                        reward: reward
                                    });

                                    if (reward > 0) {
                                        isWin = true;
                                        updateReward = updateReward + reward;
                                    }

                                }

                                if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                                if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                                if (isWin) await PushNotify(
                                    orderData.userId, 
                                    "Thông Báo Trúng Thưởng", 
                                    "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Keno #" + orderData.ticketId + "."
                                    );
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
                                        LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                                        LotteryNotifyModel.NOTIFY_SLUG_ENUM.KENO,
                                        LotteryNotifyModel.NOTIFY_NAME_ENUM.KENO,
                                        "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                                        orderData.ticketId
                                    );
                                }
                            } catch (error) {
                                console.log(error.message);
                            }
                            break;


                        // CHẴN LẺ KENO
                        case "chanle_lonnho":
                            try {
                                dataUpdateChanLe = {}, dataUpdateChanLe.data = [], dataUpdateChanLe.result = {};
                                let isWinChanLe: boolean = false;
                                let updateRewardChanLe: number = 0;

                                const chan = data.total.chan, le = data.total.le, lon = data.total.lon, nho = data.total.nho;

                                for await (const i of orderDetail.data) {


                                    let reward: number = 0;

                                    if (data.total) {

                                        switch (i.select) {

                                            case "chanle_chansm":
                                                reward = (chan == 11 || chan == 12) ? 20000 : 0;
                                                break;

                                            case "chanle_lesm":
                                                reward = (le == 11 || le == 12) ? 20000 : 0;
                                                break;

                                            case "chanle_chanlg":
                                                reward = (chan == 13 || chan == 14) ? 40000 : (chan >= 15) ? 200000 : 0;
                                                break;

                                            case "chanle_lelg":
                                                reward = (le == 13 || le == 14) ? 40000 : (le >= 15) ? 200000 : 0;
                                                break;

                                            case "chanle_hoa":
                                                reward = (chan == 10 || le == 10) ? 20000 : 0;
                                                break;

                                            case "lonnho_nho":
                                                reward = (nho == 11 || nho == 12) ? 10000 : (nho >= 13) ? 26000 : 0;
                                                break;

                                            case "lonnho_hoa":
                                                reward = (nho == 10 || lon == 10) ? 26000 : 0;
                                                break;

                                            case "lonnho_lon":
                                                reward = (lon == 11 && lon == 12) ? 10000 : (lon >= 13) ? 26000 : 0;
                                                break;

                                        }

                                        reward = reward * (i.price / 10000);

                                        dataUpdateChanLe["data"].push({
                                            select: (reward > 0) ? i.select : "",
                                            reward: reward
                                        });

                                        if (reward > 0) {
                                            isWinChanLe = true;
                                            updateRewardChanLe = updateRewardChanLe + reward;
                                        }

                                    }

                                }

                                if (isWinChanLe) await SymtemSetReward(orderData.id, orderData.userId, updateRewardChanLe);
                                if (isWinChanLe) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateRewardChanLe);
                                if (isWinChanLe) await PushNotify(
                                    orderData.userId, 
                                    "Thông Báo Trúng Thưởng", 
                                    "Bạn vừa trúng " + helper.numberformat(updateRewardChanLe) + "đ vé Keno #" + orderData.ticketId + "."
                                    );
                                await UpdateTicketReward(orderData.ticketId, updateRewardChanLe); // cộng vào tổng thưởng của ticket

                                dataUpdateChanLe.result.iswin = isWinChanLe, dataUpdateChanLe.result.totalreward = updateRewardChanLe;

                                const orderUpdateChanle = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                                orderUpdateChanle.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                                orderUpdateChanle.resultDetail = JSON.stringify(dataUpdateChanLe);
                                orderUpdateChanle.resultStatus = (isWinChanLe) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                                await orderUpdateChanle.save();
                                await orderUpdateChanle.reload();

                                if (isWinChanLe) {
                                    await UserNotifyAdd(
                                        orderData.userId,
                                        LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                                        LotteryNotifyModel.NOTIFY_SLUG_ENUM.KENO,
                                        LotteryNotifyModel.NOTIFY_NAME_ENUM.KENO,
                                        "Bạn đã trúng " + helper.numberformat(updateRewardChanLe) + "đ vé " + orderData.ticketId + ".",
                                        orderData.ticketId
                                    );
                                }
                            } catch (error) {
                                console.log(error.message);
                            }
                            break;
                    }
                };

            } catch (error) {
                status = false, message = error.message;
            }

            break;

        case LotteryResultsModel.GAME_ENUM.POWER:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                for (const orderData of OrderItem) {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {

                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                        const arrResult = LotteryHelper.arrayStringToNumber(data.result);

                        const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                        const reward = LotteryHelper.getRewardPower(arrBet.length, checkSame.length);

                        dataUpdate["data"].push({
                            number: checkSame,
                            reward: reward
                        });

                        if (reward > 0) {
                            isWin = true;
                            updateReward = updateReward + reward;
                        }

                        switch(orderDetail.level) {
                            case 5:
                                //if(updateReward >= 240000000) updateReward = 240000000; 
                            break;
                            case 6:
                                if(updateReward >= 30000000000) updateReward = 30000000000; 
                            break;
                            case 7:
                                //if(updateReward >= 240000000) updateReward = 240000000; 
                            break;
                            case 8:
                                //if(updateReward >= 487500000) updateReward = 487500000; 
                            break;
                            case 9:
                                //if(updateReward >= 743500000) updateReward = 743500000; 
                            break;
                            case 10:
                                //if(updateReward >= 1009000000) updateReward = 1009000000; 
                            break;
                            case 11:
                                //if(updateReward >= 1285000000) updateReward = 1285000000; 
                            break;
                            case 12:
                                //if(updateReward >= 1572500000) updateReward = 1572500000; 
                            break;
                            case 13:
                                //if(updateReward >= 1872500000) updateReward = 1872500000; 
                            break;
                            case 14:
                                //if(updateReward >= 2186000000) updateReward = 2186000000; 
                            break;
                            case 15:
                                //if(updateReward >= 2514000000) updateReward = 2514000000; 
                            break;
                            case 18:
                                //if(updateReward >= 3595000000) updateReward = 3595000000; 
                            break;
                        }

                    };

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                    if (isWin) await PushNotify(
                        orderData.userId, 
                        "Thông Báo Trúng Thưởng", 
                        "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Power #" + orderData.ticketId + "."
                        );
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket  

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.POWER,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.POWER,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                            orderData.ticketId
                        );
                    }

                };

            } catch (error) {
                status = false, message = error.message;
            }
            break;

        case LotteryResultsModel.GAME_ENUM.MEGA:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                for (const orderData of OrderItem) {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {

                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                        const arrResult = LotteryHelper.arrayStringToNumber(data.result);
                        const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                        const reward = LotteryHelper.getRewardMega(arrBet.length, checkSame.length);

                        dataUpdate["data"].push({
                            number: checkSame,
                            reward: reward
                        });

                        if (reward > 0) {
                            isWin = true;
                            updateReward = updateReward + reward;
                        }

                        
                        switch(orderDetail.level) {
                            case 5:
                                //if(updateReward >= 390000000) updateReward = 390000000; 
                            break;
                            case 6:
                                if(updateReward >= 12000000000) updateReward = 12000000000; 
                            break;
                            case 7:
                                //if(updateReward >= 60000000) updateReward = 60000000; 
                            break;
                            case 8:
                                //if(updateReward >= 124000000) updateReward = 124000000; 
                            break;
                            case 9:
                               // if(updateReward >= 194100000) updateReward = 194100000; 
                            break;
                            case 10:
                               // if(updateReward >= 269400000) updateReward = 269400000; 
                            break;
                            case 11:
                                //if(updateReward >= 351000000) updateReward = 351000000; 
                            break;
                            case 12:
                                //if(updateReward >= 439500000) updateReward = 439500000; 
                            break;
                            case 13:
                                //if(updateReward >= 535500000) updateReward = 535500000; 
                            break;
                            case 14:
                                //if(updateReward >= 639600000) updateReward = 639600000; 
                            break;
                            case 15:
                                //if(updateReward >= 752400000) updateReward = 752400000; 
                            break;
                            case 18:
                               // if(updateReward >= 390000000) updateReward = 1149000000; 
                            break;
                        }
                           
                    };

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                    if (isWin) await PushNotify(
                        orderData.userId, 
                        "Thông Báo Trúng Thưởng", 
                        "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Mega #" + orderData.ticketId + "."
                        );
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket  

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MEGA,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MEGA,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                            orderData.ticketId
                        );
                    }

                };

            } catch (error) {
                status = false, message = error.message;
            }
            break;

        case LotteryResultsModel.GAME_ENUM.MAX3D:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                for (const orderData of OrderItem) {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaikhuyenkhich = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {
                        let reward: number = 0;
                        const arrBet = i.number;
                        const numBet = i.number[0];

                        const isWinGN = (data.result.giainhat.indexOf(numBet) > -1) ? true: false;
                        const isWinGNhi = (data.result.giainhi.indexOf(numBet) > -1) ? true: false;
                        const isWinGBa = (data.result.giaiba.indexOf(numBet) > -1) ? true: false;
                        const isWinGKK = (data.result.giaikhuyenkhich.indexOf(numBet) > -1) ? true: false;

                        if(isWinGN || isWinGNhi || isWinGBa || isWinGKK) isWin = true;

                        if(isWinGN == true) {
                            reward = 0;
                            reward = 1000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giainhat"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giainhat),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGNhi) {
                            reward = 0;
                            reward = Number(LotteryHelper.checkSame(arrBet, data.result.giainhi).length) * 350000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giainhi"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giainhi),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGBa) {
                            reward = 0;
                            reward = Number(LotteryHelper.checkSame(arrBet, data.result.giaiba).length) * 210000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaiba"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giaiba),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGKK) {
                            reward = 0;
                            reward = Number(LotteryHelper.checkSame(arrBet, data.result.giaikhuyenkhich).length) * 210000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaikhuyenkhich"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giaikhuyenkhich),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                    };

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                    if (isWin) await PushNotify(
                        orderData.userId, 
                        "Thông Báo Trúng Thưởng", 
                        "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Max3D #" + orderData.ticketId + "."
                        );
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket  

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX3D,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX3D,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                            orderData.ticketId
                        );
                    }

                };

            } catch (error) {
                status = false, message = error.message;
            }
            break;


        case LotteryResultsModel.GAME_ENUM.MAX3DPLUS:
            try {

                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });


                for (const orderData of OrderItem) {

                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaitu = [],
                        dataUpdate.data.giainam = [],
                        dataUpdate.data.giaisau = [],
                        dataUpdate.data.giaibay = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {

                        let reward: number = 0;

                        const arrBet = i.number;
                        
                        const isWinGN = (LotteryHelper.checkSame(arrBet, data.result.giainhat).length >= 2) ? true: false;
                        const isWinGNhi = (LotteryHelper.checkSame(arrBet, data.result.giainhi).length >= 2) ? true: false;
                        const isWinGBa = (LotteryHelper.checkSame(arrBet, data.result.giaiba).length >= 2) ? true: false;
                        const isWinGT = (LotteryHelper.checkSame(arrBet, data.result.giaikhuyenkhich).length >= 2) ? true: false;

                        const join123KK = data.result.giainhat.concat(data.result.giainhi).concat(data.result.giaiba).concat(data.result.giaikhuyenkhich);
                        const isWinGNam = (LotteryHelper.checkSame(arrBet, join123KK).length >= 2) ? true: false;
                        
                        const isWinGS = (LotteryHelper.checkSame(arrBet, data.result.giainhat).length >= 1) ? true: false;
                        const join23KK = data.result.giainhi.concat(data.result.giaiba).concat(data.result.giaikhuyenkhich);
                        const isWinGBay = (LotteryHelper.checkSame(arrBet, join23KK).length >= 1) ? true: false;

                        if(isWinGN || isWinGNhi || isWinGBa || isWinGT || isWinGNam || isWinGS || isWinGBay) isWin = true;


                        if(isWinGN == true) {
                            reward = 0;
                            reward = 2 * 1000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giainhat"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giainhat),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGNhi) {
                            reward = 0;
                            reward = 2 * 40000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giainhi"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giainhi),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGBa) {
                            reward = 0;
                            reward = 2 * 10000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaiba"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giaiba),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGT) {
                            reward = 0;
                            reward = 2 * 5000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaitu"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giaikhuyenkhich),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGT) {
                            reward = 0;
                            reward = 2 * 5000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaitu"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giaikhuyenkhich),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGNam) {
                            reward = 0;
                            reward = 2 * 1000000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giainam"].push({
                                number: LotteryHelper.checkSame(arrBet, join123KK),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGS) {
                            reward = 0;
                            reward = 150000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaisau"].push({
                                number: LotteryHelper.checkSame(arrBet, data.result.giainhat),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }

                        if(isWinGBay) {
                            reward = 0;
                            reward = 40000;
                            reward = reward * (i.price / 10000);
                            dataUpdate["data"]["giaibay"].push({
                                number: LotteryHelper.checkSame(arrBet, join23KK),
                                reward: reward
                            });
                            updateReward = updateReward + reward;
                        }
                        
                    };

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                    if (isWin) await PushNotify(
                        orderData.userId, 
                        "Thông Báo Trúng Thưởng", 
                        "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Max3DPlus #" + orderData.ticketId + "."
                        );
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket  

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX3DPLUS,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX3DPLUS,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                            orderData.ticketId
                        );
                    }


                };

            } catch (error) {
                status = false, message = error.message;
            }
            break;


        case LotteryResultsModel.GAME_ENUM.MAX4D:
            try {
                let dataUpdate: any = null;
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                for (const orderData of OrderItem) {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaikhuyenkhich1 = [],
                        dataUpdate.data.giaikhuyenkhich2 = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for await (const i of orderDetail.data) {
                        switch (orderDetail.childgame) {

                            // ĐẶT SỐ TRUYỀN THỐNG MAX4D
                            case "basic":

                                let reward: number = 0;
                                const arrBet = i.number;
                                const numBet = i.number[0];
                            
                                const isWinGN = (numBet == data.result.giainhat[0]) ? true: false;
                                const isWinGNhi = (LotteryHelper.checkSame(arrBet, data.result.giainhi).length >= 1) ? true: false;
                                const isWinGBa = (LotteryHelper.checkSame(arrBet, data.result.giaiba).length >= 1) ? true: false;
                            

                                if(isWinGN || isWinGNhi || isWinGBa) isWin = true;


                                if(isWinGN == true) {
                                    reward = 0;
                                    reward = i.price * 1500;
                                    dataUpdate["data"]["giainhat"].push({
                                        number: arrBet,
                                        reward: reward
                                    });
                                    updateReward = updateReward + reward;
                                }
        
                                if(isWinGNhi) {
                                    reward = 0;
                                    reward = i.price * 650;
                                    dataUpdate["data"]["giainhi"].push({
                                        number: arrBet,
                                        reward: reward
                                    });
                                    updateReward = updateReward + reward;
                                }
        
                                if(isWinGBa) {
                                    reward = 0;
                                    reward = i.price * 300;
                                    dataUpdate["data"]["giaiba"].push({
                                        number: arrBet,
                                        reward: reward
                                    });
                                    updateReward = updateReward + reward;
                                }
        
                            break;


                            // ĐẶT TỔ HỢP
                            case "tohop":
                                // code here
                            break;
                        }

                    };

                    if (isWin) await SymtemSetReward(orderData.id, orderData.userId, updateReward);
                    if (isWin) await NotifyWhenLimitReward(orderData.userId, orderData.type, updateReward);
                    if (isWin) await PushNotify(
                        orderData.userId, 
                        "Thông Báo Trúng Thưởng", 
                        "Bạn vừa trúng " + helper.numberformat(updateReward) + "đ vé Max4D #" + orderData.ticketId + "."
                        );
                    await UpdateTicketReward(orderData.ticketId, updateReward); // cộng vào tổng thưởng của ticket 

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                    if (isWin) {
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_TYPE_ENUM.WIN,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX4D,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX4D,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + ".",
                            orderData.ticketId
                        );
                    }

                };


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
    updateResult
};
