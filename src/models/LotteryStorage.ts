import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface LotteryStoragesInterface {
    id: number;
    name: string;
    path: string;
    slug: string;
    date: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryStoragesModel extends Model<LotteryStoragesInterface> implements LotteryStoragesInterface {
    public id!: number;
    public name: string;
    public path: string;
    public slug: string;
    public date: string;
    public createdAt: Date;
    public updatedAt: Date;
    static readonly STORAGE_ENUM = {
        // DELAY: "delay",
    };
}

const LotteryStoragesDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    path: {
        type: DataTypes.STRING,
    },
    slug: {
        type: DataTypes.STRING,
    },
    date: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryStoragesModel.init(LotteryStoragesDefine, {
    paranoid: true,
    tableName: "lottery_storages",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

export {
    LotteryStoragesInterface,
    LotteryStoragesModel,
};