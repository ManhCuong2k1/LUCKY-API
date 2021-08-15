import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface LotteryNumberExcelsInterface {
    id: number;
    name: string;
    path: string;
    date: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryNumberExcelsModel extends Model<LotteryNumberExcelsInterface> implements LotteryNumberExcelsInterface {
    public id!: number;
    public name: string;
    public path: string;
    public date: string;
    public createdAt: Date;
    public updatedAt: Date;
}

const LotteryNumberExcelsDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    path: {
        type: DataTypes.STRING,
    },
    date: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryNumberExcelsModel.init(LotteryNumberExcelsDefine, {
    paranoid: true,
    tableName: "lottery_number_excels",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

export {
    LotteryNumberExcelsInterface,
    LotteryNumberExcelsModel,
};