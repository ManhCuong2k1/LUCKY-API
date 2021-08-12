import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryTicketInterface {
    id: number;
    userId: number;
    type: string;
    preriod: number;
    totalPrice: number;
    orderDetail: string;
    orderStatus: string;
    resultDetail: string;
    moreDetail: string;
    totalreward: number;
    employeStatus: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryTicketModel extends Model<LotteryTicketInterface> implements LotteryTicketInterface {
    public id!: number;
    public userId: number;
    public type: string;
    public preriod: number;
    public totalPrice: number;
    public orderDetail: string;
    public orderStatus: string;
    public resultDetail: string;
    public moreDetail: string;
    public totalreward: number;
    public employeStatus: string;
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
        LOTO234: "loto234",
    };
    static readonly TICKET_ENUM = {
        DELAY: "delay",
        PRINTED: "printed",
        DRAWNED: "drawned",
        WINNED: "winned",
        CANCELED: "canceled"
    };
    static readonly RESULTSTATUS_ENUM = {
        WINNED: "TRÚNG GIẢI",
        DRAWNED: "ĐÃ IN VÉ",
        DELAY: "CHỜ IN VÉ"
    };
    static readonly EMPLOYESTATUS_ENUM = {
        RECEIVED: "received",
        NOT_RECEIVED: "not_received",
        RECEIVING: "receiving",
    }
}

const LotteryTicketDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    type: {
        type: DataTypes.STRING(300),
    },
    preriod: {
        type: DataTypes.INTEGER,
    },
    totalPrice: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
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
    moreDetail: {
        type: DataTypes.STRING,
    },
    totalreward: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
    },
    employeStatus: {
        type: DataTypes.STRING(300),
        defaultValue: LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryTicketModel.init(LotteryTicketDefine, {
    paranoid: true,
    tableName: "lottery_tickets",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize,
});


export {
    LotteryTicketInterface,
    LotteryTicketModel
};
