import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryOrdersInterface {
    id: number;
    userId: string;
    type: string;
    roundId: string;
    orderDetail: string;    
    orderStatus: string;
    resultStatus: string;
    finishTime: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class LotteryOrdersModel extends Model<LotteryOrdersInterface> implements LotteryOrdersInterface {
    public id!: number;
    public userId: string;
    public type: string;
    public roundId: string;
    public orderDetail: string;    
    public orderStatus: string;
    public resultStatus: string;
    public finishTime: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
}

const LotteryOrdersDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING(300),
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
    resultStatus: {
        type: DataTypes.STRING,
    },
    finishTime: {
        type: DataTypes.STRING(300),
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

LotteryOrdersModel.init(LotteryOrdersDefine, {
    paranoid: true,
    tableName: "lottery_orders",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryOrdersInterface, 
    LotteryOrdersModel
};