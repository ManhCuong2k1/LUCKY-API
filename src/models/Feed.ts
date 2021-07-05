import {
  DataTypes, Model, ModelScopeOptions, Sequelize, Op,
  BelongsToManySetAssociationsMixin, BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin, HasManyCountAssociationsMixin,
} from "sequelize";
import _ from "lodash";
import sequelize from "@database/connection";
import FeedRestrictionRuleModel from "@models/FeedRestrictionRule";
import { UserModel } from "@models/User";
import { FeedCommentModel, FeedCommentInterface } from "@models/FeedComment";
import { HashTagModel } from "@models/HashTag";
import { FeedLikeModel } from "./FeedLike";

interface FeedInterface {
  id: number;
  authorId: number;
  content: string;
  image: string;
  status: string;
  isBlockComment: boolean;
  totalShare: number;
  totalView: number;
  comments?: FeedCommentInterface[];
  "$totalComment$"?: number;
  "$totalLike$"?: number;
  createdAt: Date;
  deletedAt: Date;
}

class FeedModel extends Model<FeedInterface>
  implements FeedInterface {
    // Attributes defination
    public id!: number;
    public authorId!: number;
    public content: string;
    public image: string;
    public status: string;
    public isBlockComment: boolean;
    public totalShare: number;
    public totalView: number;
    public comments?: FeedCommentInterface[];
    public "$totalComment$"?: number;
    public "$totalLike$"?: number;
    public createdAt: Date;
    public deletedAt: Date;
    static readonly STATUS_ENUM = { DRAFT: "draft", PUBLISH: "publish" }

    public setFeedHashTags: BelongsToManySetAssociationsMixin<HashTagModel, number>;
    public addFeedHashTags: BelongsToManyAddAssociationsMixin<HashTagModel, number>;
    public getFeedHashTags: BelongsToManyGetAssociationsMixin<HashTagModel>
    public countLikes: HasManyCountAssociationsMixin;
    public countComments: HasManyCountAssociationsMixin;

    // Scopes defination
    static readonly scopes: ModelScopeOptions = {
      byId(id) {
        return {
          where: { id }
        };
      },
      byDateRange(from, to) {
        return {
          where: {
            createdAt: { [Op.between]: [from, to] }
          }
        };
      },
      byExtraQueries(query) {
        return {
          where: { ...query }
        };
      },
      withBasicInfo: {
        attributes: {
          include: [
            [
              Sequelize.literal("(SELECT COUNT(*) FROM feed_comments WHERE feed_comments.feedId = FeedModel.id and feed_comments.deletedAt IS NULL)"),
              "totalComment"
            ],
            [
              Sequelize.literal("(SELECT COUNT(*) FROM feed_likes WHERE feed_likes.feedId = FeedModel.id)"),
              "totalLike"
            ]
          ]
        },
        include: [
          {
            model: UserModel,
            as: "author",
            attributes: ["id", "nickname", "name", "avatar"]
          },
        ],
        where: { status: FeedModel.STATUS_ENUM.PUBLISH },
        order: [["createdAt", "DESC"]]
      }
    }

    // Instance methods defination
    public async isValidContent() {
      const restrictionRules = await FeedRestrictionRuleModel.findOne();
      const isContainForbiddenWords = restrictionRules.forbiddenWords.some((word) => {
        return this.content.includes(word);
      });
      if (isContainForbiddenWords) return false;
      const wordCount = this.content.split(" ").length;
      if (wordCount < restrictionRules.minimumWordCount) return false;
      const isContainForbiddenUrls = restrictionRules.forbiddenUrls.some((url) => {
        return this.content.includes(url);
      });
      if (isContainForbiddenUrls) return false;
      return true;
    }

    public async loadComments(){
      const comments = await FeedCommentModel.scope([{ method: ["byFeedId", this.id] }]).findAll();
      const rootComments = _.remove(comments, (comment) => { return comment.feedCommentId === null; });
      rootComments.forEach((rootComment) => {
        const repliedComments = _.remove(comments, (comment) => { return comment.feedCommentId === rootComment.id; });
        rootComment.setDataValue("repliedComments", repliedComments);
      });
      return rootComments;
    }
  }

const FeedDefine = {
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  },
  authorId: {
    type: DataTypes.INTEGER, allowNull: false },
  content: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(FeedModel.STATUS_ENUM) }),
    defaultValue: FeedModel.STATUS_ENUM.DRAFT
  },
  isBlockComment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totalShare: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalView: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE
  },
  deletedAt: {
    type: DataTypes.DATE
  }
};

FeedModel.init(FeedDefine, {
  paranoid: true,
  scopes: FeedModel.scopes,
  deletedAt: "deletedAt",
  tableName: "feeds",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
    FeedInterface,
    FeedModel
};
