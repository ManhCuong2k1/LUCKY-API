import { DataTypes, Model} from "sequelize";
import sequelize from "@database/connection";

interface UserHistoryInterface {
    id: number;
    userId: number;
    actionSlug: string;
    actionName: string;
    detail: string;
    createdAt: Date;
    updatedAt: Date;
}

class UserHistoryModel extends Model<UserHistoryInterface> implements UserHistoryInterface {
    public id!: number;
    public userId: number;
    public actionSlug: string;
    public actionName: string;
    public detail: string;
    public createdAt: Date;
    public updatedAt: Date;

    static readonly ACTION_SLUG_ENUM = {
        RECHARGE: "rechage",
        BUY_TICKET: "buy_ticket",
        EXCHANGE_REWARD: "exchange_reward"
    }

    static readonly ACTION_NAME_ENUM = {
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
    actionSlug: {
        type: DataTypes.STRING(300),
    },
    actionName: {
        type: DataTypes.STRING(300),
    },
    detail: {
        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

UserHistoryModel.init(UserHistoryDefine, {
    paranoid: true,
    tableName: "lottery_user_historys",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    UserHistoryInterface,
    UserHistoryModel
};
