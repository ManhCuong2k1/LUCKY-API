import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface SupplierInterface {
  id: number;
  name: string;
  slug: string;
  isHome: boolean;
  avatar: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class SupplierModel extends Model<SupplierInterface> implements SupplierInterface
{
  public id!: number;
  public name: string;
  public slug: string;
  public isHome: boolean;
  public avatar: string;
  public description: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = { DRAFT: "draft", PUBLISH: "publish " };

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

const SupplierDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(300),
  },
  slug: {
    type: DataTypes.STRING(600),
  },
  isHome: {
    type: DataTypes.BOOLEAN,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(SupplierModel.STATUS_ENUM) }),
    defaultValue: SupplierModel.STATUS_ENUM.DRAFT,
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

SupplierModel.init(SupplierDefine, {
  paranoid: true,
  scopes: SupplierModel.scopes,
  tableName: "suppliers",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { SupplierInterface, SupplierModel };
