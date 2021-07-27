import { Model, DataTypes } from "sequelize";
import connection from "@database/connection";
import {UserInterface} from "@models/User";
import sequelize from "@database/connection";

interface RoleInterface {
    id: number;
    slug: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}


class RoleModel extends Model<RoleInterface> implements RoleInterface {
    public id!: number;
    public slug: string;
    public name: string;
    public createdAt: Date;
    public updatedAt: Date;
    static readonly ADMIN_ENUM = {
        SLUG: "admin",
        NAME: "Quản Trị Viên"
    };
    static readonly EMPLOYE_ENUM = {
        SLUG: "employe",
        NAME: "Nhân Viên"
    };
    static readonly USER_ENUM = {
        SLUG: "user",
        NAME: "Thành Viên"
    };
}

const RoleDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    slug: {
        type: DataTypes.STRING(300),
    },
    name: {
        type: DataTypes.STRING(300),
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

RoleModel.init(RoleDefine, {
    paranoid: true,
    tableName: "roles",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    indexes: [
        {
            unique: true,
            fields: ["slug"]
        }
    ],
    sequelize,
});

const admin: any = {
    slug: RoleModel.ADMIN_ENUM.SLUG,
    name: RoleModel.ADMIN_ENUM.NAME    
};
const employe: any = {
    slug: RoleModel.EMPLOYE_ENUM.SLUG,
    name: RoleModel.EMPLOYE_ENUM.NAME    
};
const user: any = {
    slug: RoleModel.USER_ENUM.SLUG,
    name: RoleModel.USER_ENUM.NAME    
};


sequelize.sync().then(async () => {
    const adminCheckExist = await RoleModel.findOne({
        where: {
            slug: RoleModel.ADMIN_ENUM.SLUG
        }
    });
    const employeCheckExist = await RoleModel.findOne({
        where: {
            slug: RoleModel.EMPLOYE_ENUM.SLUG
        }
    });
    const userCheckExist = await RoleModel.findOne({
        where: {
            slug: RoleModel.USER_ENUM.SLUG
        }
    });
    if(adminCheckExist == null) { await RoleModel.create(admin); }
    if(employeCheckExist == null) { await RoleModel.create(employe); }
    if(userCheckExist == null) { await RoleModel.create(user); }

});

export  {
    RoleInterface,
    RoleModel
};
