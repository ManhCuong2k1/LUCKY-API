import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { UpdateUserReward } from "./User";

interface LotteryOrdersInterface {
    id: number;
    ticketId: number;
    userId: number;
    type: string;
    roundId: string;
    orderDetail: string;
    orderStatus: string;
    resultDetail: string;
    resultStatus: string;
    received: number;
    custody: number;
    finishTime: string;
    moreDetail: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryOrdersModel extends Model<LotteryOrdersInterface> implements LotteryOrdersInterface {
    public id!: number;
    public ticketId: number;
    public userId: number;
    public type: string;
    public roundId: string;
    public orderDetail: string;
    public orderStatus: string;
    public resultDetail: string;
    public resultStatus: string;
    public received: number;
    public custody: number;
    public finishTime: string;
    public moreDetail: string;
    public createdAt: Date;
    public updatedAt: Date;
    static readonly GAME_ENUM = {
        KENO: "keno",
        POWER: "power",
        MEGA: "mega",
        MAX3D: "max3d",
        MAX3DPLUS: "max3dplus",
        MAX4D: "max4d",
        COMPUTE123: "compute123",
        COMPUTE636: "compute636",
        THANTAI4: "godofwealth",
        LOTO2: "loto2",
        LOTO3: "loto3",
        LOTO5: "loto5",
        LOTO234: "loto234",
        KIENTHIET: "kienthiet",
    };
    static readonly ORDERSTATUS_ENUM = {
        DELAY: "delay",
        PRINTED: "printed",
        DRAWNED: "drawned",
        WINNED: "winned",
        CANCELED: "canceled"
    };
    static readonly RESULTSTATUS_ENUM = {
        WINNED: "TRÚNG GIẢI",
        DRAWNED: "ĐÃ XỔ VÉ",
        DELAY: "Chờ Xổ"
    };
    static readonly LIMIT_MONEY_REWARD = 10000000; 
}

const LotteryOrdersDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ticketId: {
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    type: {
        type: DataTypes.STRING(300),
    },
    roundId: {
        type: DataTypes.STRING(300),
    },
    orderDetail: {
        type: DataTypes.TEXT,
    },
    orderStatus: {
        type: DataTypes.STRING(300),
    },
    resultDetail: {
        type: DataTypes.TEXT
    },
    resultStatus: {
        type: DataTypes.STRING,
    },
    received: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    custody: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    finishTime: {
        type: DataTypes.STRING(300),
    },
    moreDetail: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryOrdersModel.init(LotteryOrdersDefine, {
    paranoid: true,
    tableName: "lottery_orders",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

const getRewardReceived = async (orderId: number) => {
    try {
        const received = await LotteryOrdersModel.findOne({
            where: { id: orderId },
            attributes: ["received"]
        });

        if (received !== null) {
            return received.received;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

const UpdateUserReceived = async (orderId: number, reward: number) => {
    const OrderData = await LotteryOrdersModel.findByPk(orderId);
    if (!OrderData) throw new Error("Not found Order");
    OrderData.received = OrderData.received + reward;
    await OrderData.save();
    await OrderData.reload();
};

const UpdateUserCustody = async (orderId: number, reward: number) => {
    const OrderData = await LotteryOrdersModel.findByPk(orderId);
    if (!OrderData) throw new Error("Not found Order");
    OrderData.custody = OrderData.custody + reward;
    await OrderData.save();
    await OrderData.reload();
};

const SymtemSetReward = async (orderId: number, userId: number, reward: number) => {
    const limitReceved: number = LotteryOrdersModel.LIMIT_MONEY_REWARD;

    const checkRewardReceived = await getRewardReceived(orderId); // lấy ra số tiền mà user đã nhận
    if(checkRewardReceived <= limitReceved) {   // nếu tiền đã nhận nhở hơn hoặc bằng ngưỡng
        const sumReward = checkRewardReceived + reward;       // tính tổng tiền đã nhận và tiền sắp được nhận
        if(sumReward > limitReceved) {  // nếu tổng tiền đã nhận và tiền sắp được nhận lớn hơn ngưỡng
            const moneyMinus = limitReceved - checkRewardReceived; // số tiền cần thêm cho user
            reward = reward - moneyMinus; // set lại số tiền sắp được nhận
            await UpdateUserReceived(orderId, moneyMinus);      // cộng tiền đã nhận cho user
            await UpdateUserCustody(orderId, reward);  // tạm giữ tiền thưởng còn lại của user
            await UpdateUserReward(userId, moneyMinus);    // cộng tiền vào tài khoản cho user                               
        }else { // nếu tổng tiền đã nhận và tiền sắp được nhận nhỏ hơn ngưỡng
            await UpdateUserReceived(orderId, reward);      // cộng tiền đã nhận cho user
            await UpdateUserReward(userId, reward); // cộng tiền đã nhận cho user
        }
    }else { // nếu tiền đã nhận đã lớn hơn ngưỡng
        await UpdateUserCustody(orderId, reward);  // tạm giữ tiền thưởng user
    }

};


export {
    LotteryOrdersInterface,
    LotteryOrdersModel,
    getRewardReceived,
    UpdateUserReceived,
    UpdateUserCustody,
    SymtemSetReward
};
