import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface LotteryResultsInterface {
    id: number;
    type: string;
    date: string;
    next: string;
    round: string;
    result: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class LotteryResultsModel extends Model<LotteryResultsInterface> implements LotteryResultsInterface {
    public id!: number;
    public type: string;
    public date: string;
    public next: string;
    public round: string;
    public result: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
    static readonly GAME_ENUM = {
        KENO: "keno",
        POWER: "power",
        MEGA: "mega",
        MAX3D: "max3d",
        MAX3DPLUS: "max3dplus",
        MAX4D: "max4d",
        XOSOMIENBAC: "xosomienbac",
        COMPUTE123: "compute123",
        COMPUTE636: "compute636",
        THANTAI4: "godofwealth",
        LOTO2: "loto2",
        LOTO3: "loto3",
        LOTO5: "loto5",
        LOTO234: "loto234",
        KIENTHIET: "kienthiet",
        LOTORESULT: "loto_result",
    };
}

const LotteryResultsDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING(300),
    },

    date: {
        type: DataTypes.STRING(300),
    },
    next: {
        type: DataTypes.STRING(300),
    },
    round: {
        type: DataTypes.STRING(300),
    },
    result: {
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

LotteryResultsModel.init(LotteryResultsDefine, {
    paranoid: true,
    tableName: "lottery_results",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


// Func
const LotteryResultsCheck = async (type: string, round: string) => {
    const RoundCheck = await LotteryResultsModel.findOne({
      where: { type, round },
    });
    const exportData = (RoundCheck == null) ? false: RoundCheck;
    return exportData;
  };

export {
    LotteryResultsInterface, 
    LotteryResultsModel,
    LotteryResultsCheck
};