import { DataTypes, Model, ModelScopeOptions, Op, Sequelize } from "sequelize";
import { ModelHooks } from "sequelize/types/lib/hooks";
import sequelize from "@database/connection";
import { encryptPassword } from "@util/crypto";

interface AdminInterface {
  id: number;
  name: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  password: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  status: string;
  isEnableReceiveEmail: boolean;
  totalFeed?: number;
  totalCoin: number;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class AdminModel extends Model<AdminInterface> implements AdminInterface {
  public id: number;
  public name: string;
  public username: string;
  public nickname: string;
  public email: string;
  public avatar: string;
  public password: string;
  public gender: string;
  public dateOfBirth: Date;
  public phone: string;
  public status: string;
  public isEnableReceiveEmail: boolean;
  public totalFeed?: number;
  public totalCoin: number;
  public roleId: number;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly GENDER_ENUM = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
  };
  static readonly STATUS_ENUM = {
    BLOCKED: "blocked",
    WORKING: "working",
  };

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
    byDateRange(from, to) {
      if (from && to) {
        return {
          where: {
            createdAt: { [Op.between]: [from, to] },
          },
        };
      }

      return {
        where: {},
      };
    },
    withTotalFeed: {
      attributes: {
        include: [
          [
            Sequelize.literal(
              "(SELECT COUNT(*) FROM feeds WHERE feeds.authorId = AdminModel.id and feeds.deletedAt IS NULL)"
            ),
            "totalFeed",
          ],
        ],
      },
    },
  };

  static readonly hooks: Partial<ModelHooks<AdminModel>> = {
    beforeSave(instance, options) {
      if (instance.password) {
        instance.password = encryptPassword(instance.password);
      } else {
        instance.password = undefined;
      }
    },
  };
}

const AdminDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
  nickname: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  gender: {
    type: DataTypes.ENUM({ values: Object.values(AdminModel.GENDER_ENUM) }),
  },
  dateOfBirth: { type: DataTypes.DATEONLY },
  phone: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM({ values: Object.values(AdminModel.STATUS_ENUM) }),
    defaultValue: AdminModel.STATUS_ENUM.WORKING,
  },
  isEnableReceiveEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
  totalCoin: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  deletedAt: { type: DataTypes.DATE },
};

AdminModel.init(AdminDefine, {
  paranoid: true,
  hooks: AdminModel.hooks,
  scopes: AdminModel.scopes,
  indexes: [{ unique: true, fields: ["username"] }],
  tableName: "admins",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  deletedAt: "deletedAt",
  sequelize,
});

export { AdminModel, AdminInterface };
