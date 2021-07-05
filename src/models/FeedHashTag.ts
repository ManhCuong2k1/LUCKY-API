import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface FeedHashTagInterface {
  id: number;
  feedId: number;
  hashtagId: number;
}

class FeedHashTagModel extends Model<FeedHashTagInterface>
  implements FeedHashTagInterface {
  public id!: number;
  public feedId!: number;
  public hashtagId!: number;
}

const FeedHashTagDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  feedId: { type: DataTypes.INTEGER, allowNull: false },
  hashtagId: { type: DataTypes.INTEGER, allowNull: false }
};

FeedHashTagModel.init(FeedHashTagDefine, {
  indexes: [
    { unique: true, fields: ["feedId", "hashtagId"] },
  ],
  tableName: "feed_hashtags",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  FeedHashTagInterface,
  FeedHashTagModel
};
