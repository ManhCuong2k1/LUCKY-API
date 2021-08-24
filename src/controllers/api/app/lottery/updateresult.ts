import helper from "@controllers/api/helper/helper";
import { LotteryOrdersModel, SymtemSetReward } from "@models/LotteryOrder";
import { UpdateTicketReward } from "@models/LotteryTicket";
import { UserHistoryModel, UserHistoryAdd } from "@models/LotteryUserHistory";
import { LotteryNotifyModel, UserNotifyAdd } from "@models/LotteryNotify";
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
                                        "Trúng " + helper.numberformat(updateReward) + "đ vé Keno " + orderData.ticketId + "."
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
                                        LotteryNotifyModel.NOTIFY_SLUG_ENUM.KENO,
                                        LotteryNotifyModel.NOTIFY_NAME_ENUM.KENO,
                                        "Bạn đã trúng " + helper.numberformat(updateRewardChanLe) + "đ vé " + orderData.ticketId + "."
                                    );
                                    await UserHistoryAdd(
                                        orderData.userId,
                                        UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                                        UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                                        "Trúng " + helper.numberformat(updateRewardChanLe) + "đ vé Keno " + orderData.ticketId + "."
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

                        let reward = LotteryHelper.getRewardPower(arrBet.length, checkSame.length);
                        reward = reward * (i.price / 10000);

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
                                if(updateReward >= 240000000) updateReward = 240000000; 
                            break;
                            case 6:
                                if(updateReward >= 30000000000) updateReward = 30000000000; 
                            break;
                            case 7:
                                if(updateReward >= 240000000) updateReward = 240000000; 
                            break;
                            case 8:
                                if(updateReward >= 487500000) updateReward = 487500000; 
                            break;
                            case 9:
                                if(updateReward >= 743500000) updateReward = 743500000; 
                            break;
                            case 10:
                                if(updateReward >= 1009000000) updateReward = 1009000000; 
                            break;
                            case 11:
                                if(updateReward >= 1285000000) updateReward = 1285000000; 
                            break;
                            case 12:
                                if(updateReward >= 1572500000) updateReward = 1572500000; 
                            break;
                            case 13:
                                if(updateReward >= 1872500000) updateReward = 1872500000; 
                            break;
                            case 14:
                                if(updateReward >= 2186000000) updateReward = 2186000000; 
                            break;
                            case 15:
                                if(updateReward >= 2514000000) updateReward = 2514000000; 
                            break;
                            case 18:
                                if(updateReward >= 3595000000) updateReward = 3595000000; 
                            break;
                        }

                    };

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
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.POWER,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.POWER,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        await UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Power " + orderData.ticketId + "."
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

                        let reward = LotteryHelper.getRewardMega(arrBet.length, checkSame.length);
                
                        reward = reward * (i.price / 10000);

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
                                if(updateReward >= 390000000) updateReward = 390000000; 
                            break;
                            case 6:
                                if(updateReward >= 12000000000) updateReward = 12000000000; 
                            break;
                            case 7:
                                if(updateReward >= 60000000) updateReward = 60000000; 
                            break;
                            case 8:
                                if(updateReward >= 124000000) updateReward = 124000000; 
                            break;
                            case 9:
                                if(updateReward >= 194100000) updateReward = 194100000; 
                            break;
                            case 10:
                                if(updateReward >= 269400000) updateReward = 269400000; 
                            break;
                            case 11:
                                if(updateReward >= 351000000) updateReward = 351000000; 
                            break;
                            case 12:
                                if(updateReward >= 439500000) updateReward = 439500000; 
                            break;
                            case 13:
                                if(updateReward >= 535500000) updateReward = 535500000; 
                            break;
                            case 14:
                                if(updateReward >= 639600000) updateReward = 639600000; 
                            break;
                            case 15:
                                if(updateReward >= 752400000) updateReward = 752400000; 
                            break;
                            case 18:
                                if(updateReward >= 390000000) updateReward = 1149000000; 
                            break;
                        }

                    };

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
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MEGA,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MEGA,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        await UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Mega " + orderData.ticketId + "."
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
                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);

                        // GIAI NHAT
                        const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);
                        const rewardReciveGiaiNhat = checkSameGiaiNhat.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiNhat = rewardReciveGiaiNhat;
                        rewardGiaiNhat = rewardGiaiNhat * (i.price / 10000);

                        dataUpdate["data"]["giainhat"].push({
                            number: checkSameGiaiNhat,
                            reward: rewardGiaiNhat
                        });

                        if (rewardGiaiNhat > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhat;
                        }


                        // GIAI NHI
                        const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhi);
                        const checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);
                        const rewardReciveGiaiNhi = checkSameGiaiNhi.length * 350000; // các số trùng x 1.000.000
                        let rewardGiaiNhi = rewardReciveGiaiNhi;
                        rewardGiaiNhi = rewardGiaiNhi * (i.price / 10000);

                        dataUpdate["data"]["giainhi"].push({
                            number: checkSameGiaiNhi,
                            reward: rewardGiaiNhi
                        });

                        if (rewardGiaiNhi > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhi;
                        }

                        // GIAI BA 
                        const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giaiba);
                        const checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);
                        const rewardReciveGiaiBa = checkSameGiaiBa.length * 210000; // các số trùng x 210000
                        let rewardGiaiBa = rewardReciveGiaiBa;
                        rewardGiaiBa = rewardGiaiBa * (i.price / 10000);

                        dataUpdate["data"]["giaiba"].push({
                            number: checkSameGiaiBa,
                            reward: rewardGiaiBa
                        });

                        if (rewardGiaiBa > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiBa;
                        }


                        // GIAI KHUYEN KHICH
                        const arrResultGiaiKhuyenKhich = LotteryHelper.arrayStringToNumber(data.result.giaikhuyenkhich);
                        const checkSameGiaiKhuyenKhich = LotteryHelper.checkSame(arrBet, arrResultGiaiKhuyenKhich);
                        const rewardReciveGiaiKhuyenKhich = checkSameGiaiKhuyenKhich.length * 100000; // các số trùng x 100.000
                        let rewardGiaiKhuyenKhich = rewardReciveGiaiKhuyenKhich;
                        rewardGiaiKhuyenKhich = rewardGiaiKhuyenKhich * (i.price / 10000);

                        dataUpdate["data"]["giaikhuyenkhich"].push({
                            number: checkSameGiaiKhuyenKhich,
                            reward: rewardGiaiKhuyenKhich
                        });

                        if (rewardGiaiKhuyenKhich > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiKhuyenKhich;
                        }

                    };


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
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX3D,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX3D,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        await UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Max3D " + orderData.ticketId + "."
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
                    let isWinGN: boolean = false;
                    let rewardGiaiNhat: number = 0, rewardGiaiNhi: number = 0, rewardGiaiBa: number = 0, rewardGiaiTu: number = 0, rewardGiaiNam: number = 0, rewardGiaiSau: number = 0, rewardGiaiBay: number = 0;


                    for await (const i of orderDetail.data) {

                        const number = i.number;
                        const number1 = number[0];
                        const number2 = number[1];

                        // GIAI NHAT
                        const giainhatWinNum1 = (number1 == data.result.giainhat[0]) ? true : false;
                        const giainhatWinNum2 = (number2 == data.result.giainhat[1]) ? true : false;
                        if (giainhatWinNum1 && giainhatWinNum2) isWinGN = true;
                        if (isWinGN == true) {
                            rewardGiaiNhat = 1000000000;
                            dataUpdate["data"]["giainhat"].push({
                                number: [number1, number2],
                                reward: rewardGiaiNhat
                            });
                        } else {
                            rewardGiaiNhat = 0;
                            dataUpdate["data"]["giainhat"].push({
                                number: [],
                                reward: 0
                            });
                        }
                        if (rewardGiaiNhat > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhat;
                        }

                        // GIAI NHI
                        const giainhiWinNum1 = (data.result.giainhi.indexOf(String(number1)) > -1) ? true : false;
                        const giainhiWinNum2 = (data.result.giainhi.indexOf(String(number2)) > -1) ? true : false;

                        if (giainhiWinNum1 == true && giainhiWinNum2) {
                            rewardGiaiNhi = 40000000;
                            dataUpdate["data"]["giainhi"].push({
                                number: [number1, number2],
                                reward: rewardGiaiNhi
                            });
                        } else {
                            rewardGiaiNhi = 0;
                            dataUpdate["data"]["giainhi"].push({
                                number: [],
                                reward: 0
                            });
                        }
                        if (rewardGiaiNhi > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhi;
                        }

                        // GIAI BA 
                        const giaibaWinNum1 = (data.result.giaiba.indexOf(String(number1)) > -1) ? true : false;
                        const giaibaWinNum2 = (data.result.giaiba.indexOf(String(number2)) > -1) ? true : false;

                        if (giaibaWinNum1 == true && giaibaWinNum2) {
                            rewardGiaiBa = 10000000;
                            dataUpdate["data"]["giaiba"].push({
                                number: [number1, number2],
                                reward: rewardGiaiBa
                            });
                        } else {
                            rewardGiaiNhi = 0;
                            dataUpdate["data"]["giaiba"].push({
                                number: [],
                                reward: 0
                            });
                        }
                        if (rewardGiaiBa > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiBa;
                        }

                        // GIAI TU
                        const giaituWinNum1 = (data.result.giaikhuyenkhich.indexOf(String(number1)) > -1) ? true : false;
                        const giaituWinNum2 = (data.result.giaikhuyenkhich.indexOf(String(number2)) > -1) ? true : false;

                        
                        if (giaituWinNum1 == true && giaituWinNum2 == true) {
                            rewardGiaiTu = 5000000;
                            dataUpdate["data"]["giaitu"].push({
                                number: [number1, number2],
                                reward: rewardGiaiTu
                            });
                        } else {
                            rewardGiaiTu = 0;
                            dataUpdate["data"]["giaitu"].push({
                                number: [],
                                reward: 0
                            });
                        }
                        
                        if (rewardGiaiTu > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiTu;
                        }
                        const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const arrResultGiaiKk = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        
                        // GIAI NAM
                        const arrBet = LotteryHelper.arrayStringToNumber(number);
                        const giai5checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);
                        const giai5checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);
                        const giai5checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);
                        const giai5checkSameGiaiKk = LotteryHelper.checkSame(arrBet, arrResultGiaiKk);
                        
                        if (
                            giai5checkSameGiaiNhat.length == 1 ||
                            giai5checkSameGiaiNhi.length >= 1 ||
                            giai5checkSameGiaiBa.length >= 1 ||
                            giai5checkSameGiaiKk.length >= 1
                        ) {
                            rewardGiaiNam = 1000000;
                            dataUpdate["data"]["giainam"].push({
                                number: [number1, number2],
                                reward: rewardGiaiNam
                            });
                        }else {
                            rewardGiaiNam = 0;
                            dataUpdate["data"]["giainam"].push({
                                number: [],
                                reward: 0
                            });
                        }
                        
                        if (rewardGiaiNam > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNam;
                        }
                        

                        // GIAI SAU
                        const giai6checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);

                        if (
                            giai6checkSameGiaiNhat.length == 1
                            ) {
                            rewardGiaiSau = 150000;
                            dataUpdate["data"]["giaisau"].push({
                                number: [number1, number2],
                                reward: rewardGiaiSau
                            });
                        }else {
                            rewardGiaiSau = 0;
                            dataUpdate["data"]["giaisau"].push({
                                number: [],
                                reward: 0
                            });
                        }

                        if (rewardGiaiSau > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiSau;
                        }

                        // GIAI BAY
                        const giai7checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);
                        const giai7checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);
                        const giai7checkSameGiaiKk = LotteryHelper.checkSame(arrBet, arrResultGiaiKk);

                        if (
                            giai7checkSameGiaiNhi.length == 1 ||
                            giai7checkSameGiaiBa.length == 1 ||
                            giai7checkSameGiaiKk.length == 1
                            ) {
                            rewardGiaiBay = 40000;
                            dataUpdate["data"]["giaibay"].push({
                                number: [number1, number2],
                                reward: rewardGiaiBay
                            });
                        }else {
                            rewardGiaiBay = 0;
                            dataUpdate["data"]["giaibay"].push({
                                number: [],
                                reward: 0
                            });
                        }

                        if (rewardGiaiBay > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiBay;
                        }

                        updateReward = updateReward * (i.price / 10000);
                        
                    };

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
                        await UserNotifyAdd(
                            orderData.userId,
                            LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX3DPLUS,
                            LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX3DPLUS,
                            "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                        );
                        await UserHistoryAdd(
                            orderData.userId,
                            UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                            UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                            "Trúng " + helper.numberformat(updateReward) + "đ vé Max3D Plus " + orderData.ticketId + "."
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

                                const arrBet = LotteryHelper.arrayStringToNumber(i.number);

                                // GIAI NHAT
                                const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                                const checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);

                                if (checkSameGiaiNhat.length > 0) {
                                    const rewardGiaiNhat = i.price * 1500; // lấy giá trị đặt cược x 1.500
                                    console.log("giai nhat " + rewardGiaiNhat);
                                    dataUpdate["data"]["giainhat"].push({
                                        number: checkSameGiaiNhat,
                                        reward: rewardGiaiNhat
                                    });

                                    if (rewardGiaiNhat > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiNhat;
                                    }
                                }


                                // GIAI NHI
                                const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhi);
                                const checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);

                                if (checkSameGiaiNhi.length > 0) {

                                    const rewardGiaiNhi = i.price * 650; // lấy giá trị đặt cược x 650

                                    dataUpdate["data"]["giainhi"].push({
                                        number: checkSameGiaiNhi,
                                        reward: rewardGiaiNhi
                                    });

                                    if (rewardGiaiNhi > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiNhi;
                                    }
                                }


                                // GIAI BA
                                const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giaiba);
                                const checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);

                                if (checkSameGiaiBa.length > 0) {

                                    const rewardGiaiBa = i.price * 300; // lấy giá trị đặt cược x 300

                                    dataUpdate["data"]["giaiba"].push({
                                        number: checkSameGiaiBa,
                                        reward: rewardGiaiBa
                                    });

                                    if (rewardGiaiBa > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiBa;
                                    }
                                }


                                // GIAI KHYEN KHICH 1
                                const arrResultKK1 = LotteryHelper.arrayStringToNumber(LotteryHelper.removeFirstChar(data.result.giaikhuyenkhich1, 1));
                                const checkSameKK1 = LotteryHelper.arrayStringToNumber(LotteryHelper.checkSame(LotteryHelper.removeFirstChar(LotteryHelper.arrNumberToString(arrBet), 1), arrResultKK1));

                                if (checkSameKK1.length > 0) {

                                    const rewardKK1 = i.price * 100; // lấy giá trị đặt cược x 100

                                    dataUpdate["data"]["giaikhuyenkhich1"].push({
                                        number: checkSameKK1,
                                        reward: rewardKK1
                                    });

                                    if (rewardKK1 > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardKK1;
                                    }
                                }

                                // GIAI KHYEN KHICH 2
                                const arrResultKK2 = LotteryHelper.arrayStringToNumber(LotteryHelper.removeFirstChar(data.result.giaikhuyenkhich2, 2));
                                const checkSameKK2 = LotteryHelper.arrayStringToNumber(LotteryHelper.checkSame(LotteryHelper.removeFirstChar(LotteryHelper.arrNumberToString(arrBet), 2), arrResultKK2));

                                if (checkSameKK2.length > 0) {

                                    const rewardKK2 = i.price * 10; // lấy giá trị đặt cược x 10

                                    dataUpdate["data"]["giaikhuyenkhich2"].push({
                                        number: checkSameKK2,
                                        reward: rewardKK2
                                    });

                                    if (rewardKK2 > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardKK2;
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
                                    await UserNotifyAdd(
                                        orderData.userId,
                                        LotteryNotifyModel.NOTIFY_SLUG_ENUM.MAX4D,
                                        LotteryNotifyModel.NOTIFY_NAME_ENUM.MAX4D,
                                        "Bạn đã trúng " + helper.numberformat(updateReward) + "đ vé " + orderData.ticketId + "."
                                    );
                                    await UserHistoryAdd(
                                        orderData.userId,
                                        UserHistoryModel.ACTION_SLUG_ENUM.USER_REWARD,
                                        UserHistoryModel.ACTION_NAME_ENUM.USER_REWARD,
                                        "Trúng " + helper.numberformat(updateReward) + "đ vé Max4D " + orderData.ticketId + "."
                                    );
                                }

                                break;


                            // ĐẶT TỔ HỢP
                            case "tohop":
                                // code Tổ hợp 

                                break;
                        }

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
