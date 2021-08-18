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

                console.log(data);

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
                    const isWin: boolean = false, updateReward: number = 0;

                    for (const i of orderDetail.data) {
                        
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
