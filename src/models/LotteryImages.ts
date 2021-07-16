import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface LotteryImagesInterface {
    id: number;
    ticketId: number;
    imageslist: string;
}

class LotteryImagesModel extends Model<LotteryImagesInterface> implements LotteryImagesInterface {
    public id!: number;
    public ticketId: number;
    public imageslist: string;
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
};

LotteryImagesModel.init(LotteryImagesDefine, {
    paranoid: true,
    tableName: "lottery_images",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    LotteryImagesInterface, 
    LotteryImagesModel
};