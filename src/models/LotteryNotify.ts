import { DataTypes, Model} from "sequelize";
import sequelize from "@database/connection";

interface LotteryNotifyInterface {
    id: number;
    userId: number;
    notifySlug: string;
    notifyName: string;
    detail: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryNotifyModel extends Model<LotteryNotifyInterface> implements LotteryNotifyInterface {
    public id!: number;
    public userId: number;
    public notifySlug: string;
    public notifyName: string;
    public detail: string;
    public createdAt: Date;
    public updatedAt: Date;

    static readonly NOTIFY_SLUG_ENUM = {
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

        RECHARGE: "rechage",
        BUY_TICKET: "buy_ticket",
        EXCHANGE_REWARD: "exchange_reward"
    }

    static readonly NOTIFY_NAME_ENUM = {
        KENO: "Keno",
        POWER: "Power",
        MEGA: "Mega",
        MAX3D: "Max3D",
        MAX3DPLUS: "Max3Dplus",
        MAX4D: "Max4D",
        COMPUTE123: "Điện Toán 123",
        COMPUTE636: "Điện Toán 6x36",
        THANTAI4: "Thần Tài 4",
        LOTO2: "Loto 2 Số",
        LOTO3: "Loto 3 Số",
        LOTO5: "Loto 5 Số",
        LOTO234: "Loto 234",
        KIENTHIET: "Kiến Thiết",

        BUY_TICKET: "Mua vé",
        RECHARGE: "Nạp tiền",
        EXCHANGE_REWARD: "Đổi thưởng",
    };

}

const UserHistoryDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    notifySlug: {
        type: DataTypes.STRING,
    },
    notifyName: {
        type: DataTypes.STRING,
    },
    detail: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryNotifyModel.init(UserHistoryDefine, {
    paranoid: true,
    tableName: "lottery_notifys",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


const UserNotifyAdd = async (userId: number, notifySlug: string, notifyName: string, detail: string) => {
    const dataAction: any = {
        userId,
        notifySlug,
        notifyName,
        detail
    };
    const createNotify = await LotteryNotifyModel.create(dataAction);    
    return createNotify;
};

const GetUserNotify = async (userId: number, limit: number) => {
    const UserNotify = await LotteryNotifyModel.findAll({
        where : {
            userId
        },
        attributes: [
            "id",
            "userId",
            "notifySlug",
            "notifyName",
            "detail",
            "createdAt"
        ],
        order : [["id", "DESC"]],
        limit : limit,
    });

    return UserNotify;
};


export {
    LotteryNotifyInterface,
    LotteryNotifyModel,
    UserNotifyAdd,
    GetUserNotify
};
