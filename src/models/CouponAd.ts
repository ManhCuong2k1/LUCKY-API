import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface CouponAdInterface {
  id: number;
  couponN: number;
  banner: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class CouponAdModel
  extends Model<CouponAdInterface>
  implements CouponAdInterface
{
  public id!: number;
  public couponN: number;
  public banner: string;
  public startTime: Date;
  public endTime: Date;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly UPDATABLE_PARAMETERS = [
    "couponN",
    "banner",
    "startTime",
    "endTime",
  ];
}

const CouponAdDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  couponN: {
    type: DataTypes.INTEGER,
  },
  banner: {
    type: DataTypes.STRING(1000),
  },
  startTime: {
    type: DataTypes.DATE,
  },
  endTime: {
    type: DataTypes.DATE,
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

CouponAdModel.init(CouponAdDefine, {
  paranoid: true,
  tableName: "coupon_ads",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { CouponAdInterface, CouponAdModel };
