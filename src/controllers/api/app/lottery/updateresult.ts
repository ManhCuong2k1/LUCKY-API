import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";



const updateResult = async (game: string, data: any) => {
    switch (game) {
        case "keno":
            console.log(data);


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