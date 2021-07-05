import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { TaskModel } from "@models/Task";
import { TaskCompletionModel, TaskCompletionInterface } from "@models/TaskCompletion";

interface HashTagFollowerInterface {
  id: number;
  userId: number;
  hashtagId: number;
}

class HashTagFollowerModel extends Model<HashTagFollowerInterface>
  implements HashTagFollowerInterface {
    public id!: number;
    public userId!: number;
    public hashtagId!: number;
  }

const HashTagFollowerDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  hashtagId: { type: DataTypes.INTEGER, allowNull: false }
};

HashTagFollowerModel.init(HashTagFollowerDefine, {
  indexes: [
    { unique: true, fields: ["userId", "hashtagId"] },
  ],
  tableName: "hashtag_followers",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  HashTagFollowerInterface,
  HashTagFollowerModel
};
