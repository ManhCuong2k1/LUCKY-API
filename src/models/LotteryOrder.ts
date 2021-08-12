import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryOrdersInterface {
    id: number;
    ticketId: number;
    userId: number;
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
}

class LotteryOrdersModel extends Model<LotteryOrdersInterface> implements LotteryOrdersInterface {
    public id!: number;
    public ticketId: number;
    public userId: number;
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
    static readonly GAME_ENUM = {
        KENO: "keno",
        POWER: "power",
        MEGA: "mega",
        MAX3D: "max3d",
        MAX3DPLUS: "max3dplus",
        MAX4D: "max4d",
        COMPUTE123: "compute123",
        COMPUTE636: "compute636",
        THANTAI4: "godofwealth",
    };
    static readonly ORDERSTATUS_ENUM = {
        DELAY: "delay",
        PRINTED: "printed",
        DRAWNED: "drawned",
        WINNED: "winned",
        CANCELED: "canceled"
    };
    static readonly RESULTSTATUS_ENUM = {
        WINNED: "TRÚNG GIẢI",
        DRAWNED: "ĐÃ XỔ VÉ",
        DELAY: "Chờ Xổ"
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
        type: DataTypes.INTEGER,
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
};

LotteryOrdersModel.init(LotteryOrdersDefine, {
    paranoid: true,
    tableName: "lottery_orders",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryOrdersInterface, 
    LotteryOrdersModel
};
