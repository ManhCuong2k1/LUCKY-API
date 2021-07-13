import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryOrdersInterface {
    id: number;
    ticketId: number;
    userId: string;
    type: string;
    roundId: string;
    orderDetail: string;    
    orderStatus: string;
    resultDetail: string;
    resultStatus: string;
    finishTime: string;
    moreDetail: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class LotteryOrdersModel extends Model<LotteryOrdersInterface> implements LotteryOrdersInterface {
    public id!: number;
    public ticketId: number;
    public userId: string;
    public type: string;
    public roundId: string;
    public orderDetail: string;
    public orderStatus: string;
    public resultDetail: string;
    public resultStatus: string;
    public finishTime: string;
    public moreDetail: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
    static readonly ORDERSTATUS_ENUM = {
        DELAY: "delay",
        PRINTED: "printed",
        DRAWNED: "drawned",
        CANCELED: "canceled"
    };
    static readonly RESULTSTATUS_ENUM = {
        WINNED: "Trúng Giải",
        DRAWNED: "Đã Xổ Vé"
    };

}

const LotteryOrdersDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ticketId: {
        type: DataTypes.INTEGER,
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
    resultDetail: {
        type: DataTypes.TEXT
    },
    resultStatus: {
        type: DataTypes.STRING,
    },
    finishTime: {
        type: DataTypes.STRING(300),
    },
    moreDetail: {
        type: DataTypes.STRING,
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
