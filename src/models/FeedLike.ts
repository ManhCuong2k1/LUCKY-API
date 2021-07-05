import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface FeedLikeInterface {
  id?: number;
  userId: number;
  feedId: number;
}

class FeedLikeModel extends Model<FeedLikeInterface>
  implements FeedLikeInterface{
    public id: number;
    public userId: number;
    public feedId: number;
  }

const FeedLikeDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { type: DataTypes.INTEGER, allowNull: false},
  feedId: { type: DataTypes.INTEGER, allowNull: false }
};

FeedLikeModel.init(FeedLikeDefine, {
  tableName: "feed_likes",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  FeedLikeModel
};
