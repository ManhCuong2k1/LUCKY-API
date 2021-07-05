import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { HashTagInterface } from "@models/HashTag";

interface BannerFeedAdInterface {
  id: number;
  hashtagId: number;
  hashtag?: HashTagInterface;
  banner: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class BannerFeedAdModel
  extends Model<BannerFeedAdInterface>
  implements BannerFeedAdInterface
{
  public id!: number;
  public hashtagId: number;
  public hashtag?: HashTagInterface;
  public banner: string;
  public startTime: Date;
  public endTime: Date;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly UPDATABLE_PARAMETERS = [
    "hashtagId",
    "banner",
    "startTime",
    "endTime",
  ];
}

const BannerFeedAdDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hashtagId: {
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

BannerFeedAdModel.init(BannerFeedAdDefine, {
  paranoid: true,
  tableName: "banner_feed_ads",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { BannerFeedAdInterface, BannerFeedAdModel };
