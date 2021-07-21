import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryExchangesInterface {
    id: number;
    userId: number;
    amount: number;
    bankCode: string;
    bankNumber: string;
    bankUserName: string;
    status: string;
}

class LotteryExchangesModel extends Model<LotteryExchangesInterface> implements LotteryExchangesInterface {
    public id!: number;
    public userId: number;
    public amount: number;
    public bankCode: string;
    public bankNumber: string;
    public bankUserName: string;
    public status: string;
    static readonly BANKCODE_ENUM = {
        LOCAL: "LUCKY PLAYLOT",
        MOMO: "MOMO",
        ANGRYBANK: "ANGRYBANK"
    };
    static readonly STATUS_ENUM = {
        DELAY: "delay",
        SUCCESS: "success",
        ERROR: "error"
    };
}

const LotteryExchangesDefine = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    amount: { type: DataTypes.INTEGER },
    bankCode: { type: DataTypes.STRING },
    bankNumber: { type: DataTypes.STRING },
    bankUserName: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
};

LotteryExchangesModel.init(LotteryExchangesDefine, {
    paranoid: true,
    tableName: "lottery_exchanges",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

export {
    LotteryExchangesInterface, 
    LotteryExchangesModel
};