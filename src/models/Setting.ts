import { DataTypes, Model} from "sequelize";
import sequelize from "@database/connection";

interface SettingInterface {
    id: number;
    key: string;
    value: string;
}

class SettingModel extends Model<SettingInterface> implements SettingInterface {
    public id!: number;
    public key: string;
    public value: string;
}

const SettingDefine = {
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

SettingModel.init(SettingDefine, {
    paranoid: true,
    tableName: "lottery_setting",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});


export {
    SettingInterface,
    SettingModel
};
