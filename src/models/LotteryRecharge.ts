import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryRechargeInterface {
    id: number;
    userId: number;
    amount: number;
    method: string;
    status: string;
    detail: string;
    createdAt: Date;
    updatedAt: Date;
}


class LotteryRechargeModel extends Model<LotteryRechargeInterface> implements LotteryRechargeInterface {
    public id!: number;
    public userId: number;
    public amount: number;
    public method: string;    
    public status: string;
    public detail: string;
    public createdAt: Date;
    public updatedAt: Date;

    static readonly METHOD_ENUM = {
        MOMO: "momo",
        VNPAY: "vnpay",
    };
    static readonly STATUS_ENUM = {
        UNPAID: "unpaid",
        PAID: "paid",
        ERROR: "error"
    };
    length: number;
}



const LotteryRechargeDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    amount: {
        type: DataTypes.INTEGER,
    },
    method: {
        type: DataTypes.STRING(300),
    },
    status: {
        type: DataTypes.STRING(300),
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

LotteryRechargeModel.init(LotteryRechargeDefine, {
    paranoid: true,
    tableName: "lottery_recharges",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryRechargeInterface, 
    LotteryRechargeModel
};
