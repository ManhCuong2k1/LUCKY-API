import { DataTypes, Model} from "sequelize";
import sequelize from "@database/connection";

interface SettingsInterface {
    id: number;
    key: string;
    value: string;
}

class SettingsModel extends Model<SettingsInterface> implements SettingsInterface {
    public id!: number;
    public key: string;
    public value: string;
}

const SettingsDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING(300),
    },
    value: {
        type: DataTypes.STRING(300),
    },
};

SettingsModel.init(SettingsDefine, {
    paranoid: true,
    tableName: "lottery_settings",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    SettingsInterface,
    SettingsModel
};
