import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";


interface XosoInterface extends Model {
    id: number;
    type: string;
    date: Date;
    next: Date;
    round: number;
    result: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
class XosoModel extends Model<XosoInterface> implements XosoInterface {
    public id!: number;
    public type: string;
    public date: Date;
    public next: Date;
    public round: number;
    public result: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;

    static readonly scopes: ModelScopeOptions = {
        bySearch(searchKey) {
            if (searchKey) {
                return {
                    where: {
                        name: {
                            [Op.substring]: searchKey,
                        },
                    },
                };
            }

            return {
                where: {},
            };
        },
    };
}

const XosoDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING(300),
    },
    date: {
        type: DataTypes.DATE,
    },
    next: {
        type: DataTypes.DATE,
    },
    round: {
        type: DataTypes.INTEGER,
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


XosoModel.init(XosoDefine, {
    paranoid: true,
    scopes: XosoModel.scopes,
    tableName: "xoso_results",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

export { XosoInterface, XosoModel };
