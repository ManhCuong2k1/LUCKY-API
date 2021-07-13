import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import sequelize from "@database/connection";
import { UserModel } from "./User";
import { RoleModel } from "./Role";
import { FeedCommentModel } from "@models/FeedComment";
import { FeedModel } from "@models/Feed";
import { FeedLikeModel } from "@models/FeedLike";
import { CommentLikeModel } from "@models/CommentLike";
import { HashTagModel } from "@models/HashTag";
import { HashTagFollowerModel } from "@models/HashTagFollowers";
import { FeedHashTagModel } from "@models/FeedHashTag";
import { GroupChatModel } from "@models/GroupChat";
import { ChatLogModel } from "@models/ChatLog";
import { GroupChatMemberModel } from "@models/GroupChatMember";
import { BlogModel } from "@models/Blog";
import { CategoryModel } from "@models/Category";
import { GroupChatAdminModel } from "@models/GroupChatAdmin";
import { AdminModel } from "@models/Admin";
import { TaskModel } from "@models/Task";
import { TaskCompletionModel } from "@models/TaskCompletion";
import { CouponCategoryModel } from "@models/CouponCategory";
import { NotificationModel } from "@models/Notification";
import { BannerFeedAdModel } from "@models/BannerFeedAd";
import { LotteryModel } from "@models/Lottery";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketModel } from "@models/LotteryTicket";

// LotteryModel.belongsTo(UserModel, { constraints: false});

LotteryOrdersModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryOrdersModel.belongsTo(LotteryTicketModel, { as: "ticket", constraints: false });

UserModel.belongsTo(RoleModel, { as: "role", constraints: false });

FeedModel.belongsTo(UserModel, { as: "author", constraints: false });
FeedCommentModel.belongsTo(FeedModel, { as: "feed", constraints: false });

FeedCommentModel.belongsTo(FeedCommentModel, {
  as: "parentComment",
  constraints: false,
});
FeedCommentModel.hasMany(FeedCommentModel, {
  as: "replyComments",
  constraints: false,
});
FeedCommentModel.belongsTo(UserModel, { as: "author", constraints: false });

FeedModel.belongsToMany(UserModel, {
  through: FeedLikeModel,
  as: "liked_users",
  constraints: false,
});
FeedModel.hasMany(FeedLikeModel, { as: "likes", foreignKey: "feedId" });
FeedModel.hasMany(FeedCommentModel, { as: "comments", foreignKey: "feedId" });
FeedCommentModel.belongsToMany(UserModel, {
  through: CommentLikeModel,
  as: "liked_users",
  constraints: false,
});

FeedModel.belongsToMany(HashTagModel, { through: FeedHashTagModel, as: "feedHashTags", foreignKey: "feedId" });
HashTagModel.belongsToMany(FeedModel, { through: FeedHashTagModel, as: "feedHashTags", foreignKey: "hashtagId" });

UserModel.belongsToMany(HashTagModel, { through: HashTagFollowerModel, as: "followingHashtags", foreignKey: "userId" });
HashTagModel.belongsToMany(UserModel, { through: HashTagFollowerModel, as: "followers", foreignKey: "hashtagId" });

GroupChatModel.belongsToMany(UserModel, {
  through: GroupChatMemberModel,
  as: "members",
  constraints: false,
  foreignKey: "groupChatId",
});
UserModel.belongsToMany(GroupChatModel, {
  through: GroupChatMemberModel,
  as: "groupChats",
  constraints: false,
  foreignKey: "userId",
});
GroupChatModel.belongsToMany(AdminModel, {
  through: GroupChatAdminModel,
  as: "admins",
  constraints: false,
  foreignKey: "groupChatId",
});
AdminModel.belongsToMany(GroupChatModel, {
  through: GroupChatAdminModel,
  as: "adminGroupChats",
  constraints: false,
  foreignKey: "adminId",
});

ChatLogModel.belongsTo(UserModel, { as: "author", constraints: false });
// UserModel.hasMany(ChatLogModel, { as: "chats", constraints: false });
ChatLogModel.belongsTo(GroupChatModel, { as: "groupChat", constraints: false });
// GroupChatModel.hasMany(ChatLogModel, { as: "chats", constraints: false });

BlogModel.belongsTo(CategoryModel, { as: "category", constraints: false });

TaskModel.hasMany(TaskCompletionModel, { as: "taskCompletions", foreignKey: "taskId" });
TaskCompletionModel.belongsTo(TaskModel, { as: "task", foreignKey: "taskId" });

CouponCategoryModel.belongsTo(CouponCategoryModel, { as: "parent", foreignKey: "parentId" });

NotificationModel.belongsTo(CouponCategoryModel, { as: "couponCategory" });

BannerFeedAdModel.belongsTo(HashTagModel, { as: "hashtag" });

const models = sequelize.sync({ alter: true, logging: false });

export { models };
