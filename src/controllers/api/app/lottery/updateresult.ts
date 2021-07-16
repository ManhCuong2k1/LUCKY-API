import { LotteryModel } from "@models/Lottery";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { UserModel } from "@models/User";
import helper from "../../helper/helper";
import LotteryHelper from "./helper";


const updateResult = async (game: string, data: any) => {

    let status: boolean = true, message: any, dataUpdate: any = null, dataUpdateChanLe: any = null;

    switch (game) {
        case "keno":
            try {
                const OrderItem = await LotteryOrdersModel.findAll({ 
                    where: { 
                        type: game, 
                        roundId: data.round, 
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    } });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);

                    switch (orderDetail.childgame) {
                        
                        // ĐẶT SỐ TRUYỀN THỐNG KENO
                        case "basic":
                            dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                            let isWin: boolean = false, updateReward: number = 0;

                            for (const i of orderDetail.data) {

                                const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                                const arrResult = LotteryHelper.arrayStringToNumber(data.result);

                                const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                                    let reward = LotteryHelper.checkResult(arrBet.length, checkSame.length);
                                        reward = reward * (i.price / 10000);

                                    dataUpdate["data"].push({
                                        number: checkSame,
                                        reward: reward
                                    });

                                    if (reward > 0) {
                                        isWin = true;
                                        updateReward = updateReward + reward;
                                        
                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }

                            }

                            dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                            const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                            orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                            orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                            orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED: LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                            await orderUpdate.save();
                            await orderUpdate.reload();
                        break;


                        // CHẴN LẺ KENO
                        case "chanle_lonnho":

                            dataUpdateChanLe = {}, dataUpdateChanLe.data = [], dataUpdateChanLe.result = {};
                            let isWinChanLe: boolean = false;
                            let updateRewardChanLe: number = 0;

                            const chan = data.total.chan, le = data.total.le, lon = data.total.lon, nho = data.total.nho;

                            for (const i of orderDetail.data) {

                                
                                let reward: number = 0;

                                if(data.total) {

                                    switch(i.select) {

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
                                        select: (reward > 0) ? i.select: "",
                                        reward: reward
                                    });

                                    if (reward > 0) {
                                        isWinChanLe = true;
                                        updateRewardChanLe = updateRewardChanLe + reward;
                                        
                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + reward;

                                        console.log(UserData.totalReward + " VND");

                                        await UserData.save();
                                        await UserData.reload();
                                    }

                                }

                            }

                            dataUpdateChanLe.result.iswin = isWinChanLe, dataUpdateChanLe.result.totalreward = updateRewardChanLe;

                            const orderUpdateChanle = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                            orderUpdateChanle.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                            orderUpdateChanle.resultDetail = JSON.stringify(dataUpdateChanLe);
                            orderUpdateChanle.resultStatus = (isWinChanLe) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED: LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                            await orderUpdateChanle.save();
                            await orderUpdateChanle.reload();

                        break;
                    }
                });

            } catch (error) {
                status = false, message = error;
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
