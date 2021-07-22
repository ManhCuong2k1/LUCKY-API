import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
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
    tableName: "lottery_notify",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryNotifyInterface,
    LotteryNotifyModel
};
