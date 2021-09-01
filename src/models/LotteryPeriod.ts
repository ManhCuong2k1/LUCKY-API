import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface LotteryPeriodsInterface {
    id: number;
    type: string;
    roundId: string;
    time: number;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryPeriodsModel extends Model<LotteryPeriodsInterface> implements LotteryPeriodsInterface {
    public id!: number;
    public type: string;
    public roundId: string;
    public time: number;
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
        LOTO2: "loto2",
        LOTO3: "loto3",
        LOTO5: "loto5",
        LOTO234: "loto234",
        KIENTHIET: "kienthiet",
    };

}

const LotteryPeriodsDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING,
    },
    roundId: {
        type: DataTypes.STRING,
    },
    time: {
        type: DataTypes.BIGINT,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryPeriodsModel.init(LotteryPeriodsDefine, {
    paranoid: true,
    tableName: "lottery_periods",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

const LotteryPeriodsCheck = async (type: string, roundId: string) => {
    const RoundCheck = await LotteryPeriodsModel.findOne({
      where: { type, roundId },
    });
    const exportData = (RoundCheck == null) ? false: RoundCheck;
    return exportData;
};


export {
    LotteryPeriodsInterface,
    LotteryPeriodsModel,
    LotteryPeriodsCheck
};