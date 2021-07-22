import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
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
    static readonly ACTION_ENUM = {
        BUY_TICKET: "Mua vé",
        RECHARGE: "Nạp tiền",
        REDEEM_REWARD: "Đổi thưởng",
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
        type: DataTypes.STRING,
    },
    actionName: {
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

UserHistoryModel.init(UserHistoryDefine, {
    paranoid: true,
    tableName: "lottery_user_history",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    UserHistoryInterface,
    UserHistoryModel
};
