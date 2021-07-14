import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryImagesInterface {
    id: number;
    ticketId: number;
    imageslist: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class LotteryImagesModel extends Model<LotteryImagesInterface> implements LotteryImagesInterface {
    public id!: number;
    public ticketId: number;
    public imageslist: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
}

const LotteryImagesDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ticketId: {
        type: DataTypes.INTEGER,
    },
    imageslist: {
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

LotteryImagesModel.init(LotteryImagesDefine, {
    paranoid: true,
    tableName: "lottery_images",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryImagesInterface, 
    LotteryImagesModel
};