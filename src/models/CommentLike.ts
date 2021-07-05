import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface CommentLikeInterface {
  id?: number;
  userId: number;
  feedCommentId: number;
}

class CommentLikeModel extends Model<CommentLikeInterface>
  implements CommentLikeInterface {
  public id: number;
  public userId: number;
  public feedCommentId: number;
}

const CommentLikeDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  feedCommentId: { type: DataTypes.INTEGER, allowNull: false }
};

CommentLikeModel.init(CommentLikeDefine, {
  tableName: "comment_likes",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  CommentLikeModel
};
