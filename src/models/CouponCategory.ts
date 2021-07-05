import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface CouponCategoryInterface {
  id: number;
  title: string;
  slug: string;
  parentId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class CouponCategoryModel
  extends Model<CouponCategoryInterface>
  implements CouponCategoryInterface
{
  public id!: number;
  public title: string;
  public slug: string;
  public parentId: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = { DRAFT: "draft", PUBLISH: "publish " };
  static readonly UPDATABLE_PARAMETERS = ["title", "slug", "parentId", "status"];

  static readonly scopes: ModelScopeOptions = {
    bySearch(searchKey) {
      if (searchKey) {
        return {
          where: {
            title: {
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

const CouponCategoryDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(300),
  },
  slug: {
    type: DataTypes.STRING(600),
  },
  parentId: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(CouponCategoryModel.STATUS_ENUM) }),
    defaultValue: CouponCategoryModel.STATUS_ENUM.DRAFT,
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

CouponCategoryModel.init(CouponCategoryDefine, {
  paranoid: true,
  scopes: CouponCategoryModel.scopes,
  tableName: "coupon_categories",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { CouponCategoryInterface, CouponCategoryModel };
