import dayjs from "dayjs";
import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";
import { FeedModel } from "./Feed";
import { TaskInterface, TaskModel } from "@models/Task";
import { HashTagFollowerInterface } from "./HashTagFollowers";
import { UserModel } from "./User";
import { UserCheckinModel } from "./UserCheckin";

interface TaskCompletionInterface {
  id: number;
  userId: number;
  taskId: number;
  requirementType?: string;
  requirementId?: number;
  achieveAt: Date;
  tokenEarned: number;
}

class TaskCompletionModel extends Model<TaskCompletionInterface>
  implements TaskCompletionInterface {
    public id!: number;
    public userId!: number;
    public taskId!: number;
    public requirementType?: string;
    public requirementId?: number;
    public achieveAt!: Date;
    public tokenEarned: number;
    static readonly REQUIREMENT_TYPE_ENUM = {
      FEED: "feed",
      HASHTAG: "hashtag",
      PROMOTION_URL: "promotion_url"
    }

    static readonly scopes: ModelScopeOptions = {
      byUserId(userId) {
        return { where: { userId } };
      },
      byTaskId(taskId) {
        return { where: { taskId } };
      },
      byRequirement(requirementType, requirementId) {
        return { where: {requirementType, requirementId} };
      },
      byTaskType(type) {
        return {
          include: [
            {
              model: TaskModel,
              as: "task",
              where: { type: type },
              required: true
            }
          ]
        };
      },
      achieveBetween(from, to) {
        return {
          where: {
            achieveAt: { [Op.between]: [from, to] }
          }
        };
      }
    }

    static async completeCheckinTask(checkinRecord: UserCheckinModel, tokenEarned: number) {
      await this.create({
        id: undefined,
        userId: checkinRecord.userId,
        taskId: checkinRecord.taskId,
        achieveAt: new Date(),
        tokenEarned
      });
    }

    static async completeFeedPostingOnceTask(feed: FeedModel) {
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FEED_POSTING_ONCE);
      if (availableTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskId", availableTasks.map(task => task.id)] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(availableTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, feed.authorId);
    };

    static async completeFeedPostingMultipleTimesTask(feed: FeedModel) {
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FEED_POSTING_MULTIPLE_TIMES);
      if (availableTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskId", availableTasks.map(task => task.id)] },
        { method: ["achieveBetween", dayjs().startOf("day").format(), dayjs().endOf("day").format()]}
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(availableTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, feed.authorId);
    };

    static async completeFeedPostingWithHashtag(feed: FeedModel) {
      const feedHashtags = await feed.getFeedHashTags();
      const feedHashtagIds = feedHashtags.map((hashtag) => hashtag.id);
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FEED_HASHTAG);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return feedHashtagIds.includes(task.requirement as number);
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskId", fullfilledTasks.map(task => task.id)] },
        { method: ["byRequirement", this.REQUIREMENT_TYPE_ENUM.FEED, feed.id] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(fullfilledTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, feed.authorId, this.REQUIREMENT_TYPE_ENUM.FEED, feed.id);
    };

    static async completeFirstReachedOfLikesTask(feed: FeedModel) {
      const feedTotalLikes = await feed.countLikes();
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FIRST_LIKES);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return feedTotalLikes >= (task.requirement as number);
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskType", TaskModel.TYPE_ENUM.FIRST_LIKES]}
      ]).findAll();
      if (alreadyCompletedTasks.length) return;
      await this.create({
        id: undefined,
        userId: feed.authorId,
        taskId: fullfilledTasks[0].id,
        achieveAt: new Date(),
        tokenEarned: fullfilledTasks[0].token,
      });
    }

    static async completeFirstReachedOfCommentsTask(feed: FeedModel) {
      const feedTotalComments = await feed.countComments();
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FIRST_COMMENTS);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return feedTotalComments >= (task.requirement as number);
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskType", TaskModel.TYPE_ENUM.FIRST_COMMENTS] }
      ]).findAll();
      if (alreadyCompletedTasks.length) return;
      await this.create({
        id: undefined,
        userId: feed.authorId,
        taskId: fullfilledTasks[0].id,
        achieveAt: new Date(),
        tokenEarned: fullfilledTasks[0].token,
      });
    }

    static async completeFeedViewTask(feed: FeedModel) {
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FEED_VIEWS);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return (feed.totalView >= (task.requirement as number)
          && new Date(feed.createdAt) >= new Date(task.startDate));
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskId", fullfilledTasks.map(task => task.id)] },
        { method: ["byRequirement", this.REQUIREMENT_TYPE_ENUM.FEED, feed.id] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(fullfilledTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, feed.authorId, this.REQUIREMENT_TYPE_ENUM.FEED, feed.id);
    }

    static async completeFeedLikeTask(feed: FeedModel) {
      const feedTotalLikes = await feed.countLikes();
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.FEED_LIKES);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return (feedTotalLikes >= (task.requirement as number)
          && new Date(feed.createdAt) >= new Date(task.startDate));
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", feed.authorId] },
        { method: ["byTaskId", fullfilledTasks.map(task => task.id)] },
        { method: ["byRequirement", this.REQUIREMENT_TYPE_ENUM.FEED, feed.id] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(fullfilledTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, feed.authorId, this.REQUIREMENT_TYPE_ENUM.FEED, feed.id);
    }

    static async completeReferTask(user: UserModel) {
      const referredUsers = await UserModel.scope([{ method: ["byReferrer", user.id] }]).findAll();
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.REFER);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        const qualifiedUsers = referredUsers.filter((user) => {
          return new Date(user.createdAt) >= new Date(task.startDate);
        });
        return qualifiedUsers.length >= (task.requirement as number);
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", user.id] },
        { method: ["byTaskId", fullfilledTasks.map(task => task.id)] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(fullfilledTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, user.id);
    }

    static async completePromotionUrlTask(urlId: number, userId: number) {
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.PROMOTION_URL);
      if (availableTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", userId] },
        { method: ["byTaskId", availableTasks.map(task => task.id)] },
        { method: ["byRequirement", this.REQUIREMENT_TYPE_ENUM.PROMOTION_URL, urlId] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(availableTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, userId, this.REQUIREMENT_TYPE_ENUM.PROMOTION_URL, urlId);
    }

    static async completeHashtagFollowingTask(record: HashTagFollowerInterface) {
      const availableTasks = await TaskModel.loadAvailableTask(TaskModel.TYPE_ENUM.HASHTAG_FOLLOWING);
      if (availableTasks.length === 0) return;
      const fullfilledTasks = availableTasks.filter((task) => {
        return (task.requirement as any[]).includes(record.hashtagId);
      });
      if (fullfilledTasks.length === 0) return;
      const alreadyCompletedTasks = await this.scope([
        { method: ["byUserId", record.userId] },
        { method: ["byTaskId", fullfilledTasks.map(task => task.id)] },
        { method: ["byRequirement", this.REQUIREMENT_TYPE_ENUM.HASHTAG, record.hashtagId] },
      ]).findAll();
      const uncompletedTasks = this.getUncompletedTasks(fullfilledTasks, alreadyCompletedTasks);
      if (uncompletedTasks.length === 0) return;
      await this.completeTasks(uncompletedTasks, record.userId, this.REQUIREMENT_TYPE_ENUM.HASHTAG, record.hashtagId);
    }

    private static async completeTasks(listTasks: TaskInterface[], performer: number, requirementType?: string, requirementId?: number) {
      const taskCompletionArrays: TaskCompletionInterface[] = [];
      listTasks.forEach((task) => {
        taskCompletionArrays.push({
          id: undefined,
          userId: performer,
          taskId: task.id,
          requirementType: requirementType,
          requirementId: requirementId,
          achieveAt: new Date(),
          tokenEarned: task.token,
        });
      });
      await this.bulkCreate(taskCompletionArrays);
    }

    private static getUncompletedTasks(listTasks: TaskInterface[], alreadyCompletedTasks: TaskCompletionInterface[]) {
      const uncompletedTasks = listTasks.filter((task) => {
        return !alreadyCompletedTasks.map(obj => obj.taskId).includes(task.id);
      });
      return uncompletedTasks;
    }
  }

const TaskCompletionDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false},
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  requirementType: { type: DataTypes.STRING },
  requirementId: { type: DataTypes.INTEGER },
  achieveAt: { type: DataTypes.DATE, allowNull: false },
  tokenEarned: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
};

TaskCompletionModel.init(TaskCompletionDefine, {
  scopes: TaskCompletionModel.scopes,
  tableName: "task_completions",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  TaskCompletionModel,
  TaskCompletionInterface
};
