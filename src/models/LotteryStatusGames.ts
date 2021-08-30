import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface StatusGamesInterface {
    id: number;
    gameName: string;
    status: string;
}

class StatusGamesModel extends Model<StatusGamesInterface> implements StatusGamesInterface {
    public id!: number;
    public gameName: string;
    public status: string;
}

const StatusGamesDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    gameName: {
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
