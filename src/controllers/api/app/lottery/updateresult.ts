import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import helper from "../../helper/helper";


const updateResult = async (game: string, data: any) => {

    switch (game) {
        case "keno":
            try {
                const OrderItem = await LotteryOrdersModel.findAll({ where: { type: game, roundId: data.round, orderStatus: "delay" } });

                OrderItem.forEach((data: any) => {
                    console.log(helper.checkItemExist(data.data, data.result));
                });

            }catch (error) {
                return {
                    status: false,
                    data: error,
                    msg: "error"
                  };
            }            


        


        break;

        default:
            return {
                status: false,
                message: "error game params"
            };
        break;


    }
};



export default {
    updateResult
};