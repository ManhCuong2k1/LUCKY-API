import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface LotteryImagesInterface {
    id: number;
    LotteryTicketModelId: number;
    beforeImage: string;
    afterImage: string;
}

class LotteryImagesModel extends Model<LotteryImagesInterface> implements LotteryImagesInterface {
    public id!: number;
    public LotteryTicketModelId: number;
    public beforeImage: string;
    public afterImage: string;
}

const LotteryImagesDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    LotteryTicketModelId: {
        type: DataTypes.INTEGER,
    },
    beforeImage: {
        type: DataTypes.TEXT,
    },
    afterImage: {
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