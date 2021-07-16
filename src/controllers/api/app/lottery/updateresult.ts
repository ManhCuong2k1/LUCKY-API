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
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DELAY
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

                                if (checkSame.length > 0) {
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
                            const isWinChanLe: boolean = false, updateRewardChanLe: number = 0;




                            
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
