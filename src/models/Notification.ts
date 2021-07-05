import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";
import { CouponCategoryInterface } from "@models/CouponCategory";

interface NotificationInterface {
  id: number;
  title: string;
  brief: string;
  attachLink: string;
  status: string;
  couponCategoryId: number;
  couponCategory?: CouponCategoryInterface;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class NotificationModel
  extends Model<NotificationInterface>
  implements NotificationInterface
{
  public id!: number;
  public title: string;
  public brief: string;
  public attachLink: string;
  public status: string;
  public couponCategoryId: number;
  public couponCategory?: CouponCategoryInterface;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = {
    DRAFT: "draft",
    INSTANT_SEND: "instant_send",
  };
  static readonly UPDATABLE_PARAMETERS = [
    "title",
    "brief",
    "attachLink",
    "status",
    "couponCategoryId",
  ];

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

const NotificationDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(300),
  },
  brief: {
    type: DataTypes.STRING(500),
  },
  attachLink: {
    type: DataTypes.STRING(300),
  },
  status: {
    type: DataTypes.ENUM({
      values: Object.values(NotificationModel.STATUS_ENUM),
    }),
    defaultValue: NotificationModel.STATUS_ENUM.DRAFT,
  },
  couponCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

NotificationModel.init(NotificationDefine, {
  paranoid: true,
  scopes: NotificationModel.scopes,
  tableName: "notifications",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { NotificationInterface, NotificationModel };
