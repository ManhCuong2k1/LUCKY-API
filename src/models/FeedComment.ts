import { DataTypes, Model, ModelScopeOptions, Sequelize } from "sequelize";
import sequelize from "@database/connection";
import { UserModel } from "@models/User";
import { FeedModel } from "@models/Feed";
import { CommentLikeModel } from "@models/CommentLike";

interface FeedCommentInterface {
  id: number;
  authorId: number;
  feedId: number;
  feedCommentId: number;
  content: string;
  image: string;
  isPublished: boolean;
  repliedComments?: FeedCommentInterface[];
  deletedAt: Date;
}

class FeedCommentModel extends Model<FeedCommentInterface>
  implements FeedCommentInterface {
    public id!: number;
    public authorId!: number;
    public feedId!: number;
    public feedCommentId: number;
    public content: string;
    public image: string;
    public isPublished: boolean;
    public repliedComments?: FeedCommentInterface[];
    public deletedAt: Date;

    // Scopes defination
    static readonly scopes: ModelScopeOptions = {
      byFeedId(feedId) {
        return {
          attributes: {
            include: [
              [
                Sequelize.literal("(SELECT COUNT(*) FROM comment_likes AS c WHERE c.feedCommentId = FeedCommentModel.id)"),
                "totalLike"
              ]
            ]
          },
          include: [
            {
              model: UserModel,
              as: "author",
              attributes: ["id", "nickname", "firstName", "lastName", "avatar"]
            },
          ],
          where: { feedId, isPublished: true }
        };
      }
    }
  }

const FeedCommentDefine = {
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  feedId: { type: DataTypes.INTEGER, allowNull: false },
  feedCommentId: { type: DataTypes.INTEGER, allowNull: true },
  image: { type: DataTypes.STRING },
  content: { type: DataTypes.STRING },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  deletedAt: { type: DataTypes.DATE }
};

FeedCommentModel.init(FeedCommentDefine, {
  paranoid: true,
  scopes: FeedCommentModel.scopes,
  tableName: "feed_comments",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  FeedCommentInterface,
  FeedCommentModel
};
