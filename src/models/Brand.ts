import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface BrandInterface {
  id: number;
  name: string;
  slug: string;
  description: string;
  isHome: boolean;
  avatar: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class BrandModel extends Model<BrandInterface> implements BrandInterface {
  public id!: number;
  public name: string;
  public slug: string;
  public description: string;
  public isHome: boolean;
  public avatar: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = { DRAFT: "draft", PUBLISH: "publish" };

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

const BrandDefine = {
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
  description: {
    type: DataTypes.TEXT,
  },
  isHome: {
    type: DataTypes.BOOLEAN,
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(BrandModel.STATUS_ENUM) }),
    defaultValue: BrandModel.STATUS_ENUM.DRAFT,
  },
  avatar: {
    type: DataTypes.STRING,
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

BrandModel.init(BrandDefine, {
  paranoid: true,
  scopes: BrandModel.scopes,
  tableName: "brands",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { BrandInterface, BrandModel };
