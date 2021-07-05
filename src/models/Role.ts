import { Model, DataTypes } from "sequelize";
import connection from "@database/connection";
import {UserInterface} from "@models/User";

interface RoleInterface extends Model {
    id: number;
    slug: string;
    name: string;
}
const RoleDefine = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    slug: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    }
};

const RoleModel = connection.define<RoleInterface>("roles",RoleDefine, {
    tableName: "roles",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    indexes: [
        {
            unique: true,
            fields: ["slug"]
        }
    ]
});

export  {
    RoleInterface,
    RoleModel
};
