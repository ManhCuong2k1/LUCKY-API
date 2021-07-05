import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryInterface {
    id: number;
    type: string;
    date: string;
    next: string;
    round: number;
    result: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class LotteryModel extends Model<LotteryInterface> implements LotteryInterface {
    public id!: number;
    public type: string;
    public date: string;
    public next: string;
    public round: number;
    public result: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
}

const LotteryDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING(300),
    },

    date: {
        type: DataTypes.STRING(300),
    },
    next: {
        type: DataTypes.STRING(300),
    },
    round: {
        type: DataTypes.INTEGER,
    },
    result: {
        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
    deletedAt: {
        type: DataTypes.DATE,
    },
};

LotteryModel.init(LotteryDefine, {
    paranoid: true,
    tableName: "lottery_results",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


// Func
const LotteryCheck = async (type: string, round: string) => {
    const RoundCheck = await LotteryModel.findOne({
      where: { type, round },
    });
    const exportData = (RoundCheck == null) ? false: RoundCheck;
    return exportData;
  };

export {
    LotteryInterface, 
    LotteryModel,
    LotteryCheck
};