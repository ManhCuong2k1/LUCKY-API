import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface StatusGamesInterface {
    id: number;
    type: string;
    status: string;
}

class StatusGamesModel extends Model<StatusGamesInterface> implements StatusGamesInterface {
    public id!: number;
    public type: string;
    public status: string;
    static readonly GAME_ENUM = {
        KENO: "keno",
        POWER: "power",
        MEGA: "mega",
        MAX3D: "max3d",
        MAX3DPLUS: "max3dplus",
        MAX4D: "max4d",
        COMPUTE123: "compute123",
        COMPUTE636: "compute636",
        LOTO234: "loto234",
        LOTO2: "loto2",
        LOTO3: "loto3",
        LOTO5: "loto5",
        KIENTHIET: "kienthiet",
    };
    // static readonly STATUS_ENUM = {
    //     BLOCKED: "blocked",
    //     WORKING: "working",
    // };
}

const StatusGamesDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING(300),
    },
    status: {
        type: DataTypes.STRING(300),
    },
};

StatusGamesModel.init(StatusGamesDefine, {
    tableName: "lottery_status_games",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

export {
    StatusGamesInterface,
    StatusGamesModel,
};
