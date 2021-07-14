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
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
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
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
    static readonly TICKET_ENUM = {
        DELAY: "delay",
        PRINTED: "printed",
        DRAWNED: "drawned",
        WINNED: "winned",
        CANCELED: "canceled"
    };
    static readonly RESULTSTATUS_ENUM = {
        WINNED: "Trúng Giải",
        DRAWNED: "Đã Xổ Vé"
    };
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
        type: DataTypes.INTEGER()
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

LotteryTicketModel.init(LotteryTicketDefine, {
    paranoid: true,
    tableName: "lottery_tickets",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryTicketInterface,
    LotteryTicketModel
};
