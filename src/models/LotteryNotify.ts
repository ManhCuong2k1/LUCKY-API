import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { UserModel } from "@models/User";
import SendNotify from "@util/push-notify";
// import { creatLogFile, logFile, readlog } from "@util/logdata";
import { LotteryOrdersModel } from "./LotteryOrder";

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

const PushNotify = async (userId: number, title: string, body: string) => {
    const user = await UserModel.findByPk(userId);
    if (!user) throw new Error("User not found");
    await SendNotify(user.fcmtoken, title, body);
};

const NotifyWhenLimitReward = async (userId: number, game: string, reward: number) => {
    try {

        if (reward > 10000000) {

            let gameName: string;
            switch (game) {
                case LotteryOrdersModel.GAME_ENUM.KENO:
                    gameName = "KENO";
                    break;
                case LotteryOrdersModel.GAME_ENUM.POWER:
                    gameName = "POWER";
                    break;
                case LotteryOrdersModel.GAME_ENUM.MAX3D:
                    gameName = "MAX3D";
                    break;
                case LotteryOrdersModel.GAME_ENUM.MAX3DPLUS:
                    gameName = "MAX3D PLUS";
                    break;
                case LotteryOrdersModel.GAME_ENUM.MAX4D:
                    gameName = "MAX4D";
                    break;
                case LotteryOrdersModel.GAME_ENUM.COMPUTE123:
                    gameName = "Điện Toán 123";
                    break;
                case LotteryOrdersModel.GAME_ENUM.COMPUTE636:
                    gameName = "Điện Toán 6x36";
                    break;
                case LotteryOrdersModel.GAME_ENUM.THANTAI4:
                    gameName = "Thần Tài 4";
                    break;
                case LotteryOrdersModel.GAME_ENUM.LOTO2:
                    gameName = "LOTO 2 Số";
                    break;
                case LotteryOrdersModel.GAME_ENUM.LOTO3:
                    gameName = "LOTO 3 Số";
                    break;
                case LotteryOrdersModel.GAME_ENUM.LOTO5:
                    gameName = "LOTO 4 Số";
                    break;
                case LotteryOrdersModel.GAME_ENUM.LOTO234:
                    gameName = "LOTO 235";
                    break;
                case LotteryOrdersModel.GAME_ENUM.KIENTHIET:
                    gameName = "Kiến Thiết";
                    break;
            }

            const contents = `Vé chơi ${gameName} đã trúng lớn trên 10 triệu. Liên hệ tại cửa hàng hoặc hotline để nhận thưởng!`;
            await PushNotify(
                userId,
                "Thông báo trúng lớn!",
                contents
            );
        }

    } catch (err) {
        console.log(err.message);
    }
};

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
        where: {
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
        order: [["id", "DESC"]],
        limit: limit,
    });

    return UserNotify;
};


export {
    LotteryNotifyInterface,
    LotteryNotifyModel,
    PushNotify,
    NotifyWhenLimitReward,
    UserNotifyAdd,
    GetUserNotify
};
