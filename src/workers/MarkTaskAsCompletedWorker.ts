import { Model, Op } from "sequelize";
import Bull, { Queue } from "bull";
import { clientOptions } from "@database/redis";
import { TaskModel } from "@models/Task";
import { TaskCompletionModel, TaskCompletionInterface } from "@models/TaskCompletion";
import { FeedModel } from "@models/Feed";

class MaskTaskAsCompletedWorker {
  public task: Model<TaskModel>;
  public queue: Queue<any>;
  static readonly QUEUE_NAME = "markTaskAsCompleted"
  constructor(task: Model<TaskModel>) {
    this.task = task;
    this.queue = new Bull(MaskTaskAsCompletedWorker.QUEUE_NAME, { redis: clientOptions });
    this.queue.process(async (job, done) => {
      try {
        const { data } = job;
        const { taskId } = data;
        const task = await TaskModel.findByPk(taskId);
        if (!task) return done();
        const taskCompletions = await TaskCompletionModel.scope([{ method: ["byTaskType", task.type] }]).findAll();
        const exceptedUserIds = taskCompletions.map((instance) => instance.userId);
        const qualifedFeeds = await FeedModel.scope(["withBasicInfo"]).findAll({
          where: { authorId: { [Op.notIn]: exceptedUserIds } },
          having: {
            "$totalComment$": task.type === TaskModel.TYPE_ENUM.FIRST_COMMENTS ? { [Op.gte]: task.requirement } : { [Op.not]: null },
            "$totalLike$": task.type === TaskModel.TYPE_ENUM.FIRST_LIKES ? { [Op.gte]: task.requirement } : { [Op.not]: null },
          }
        });
        const authorIds = qualifedFeeds.map((feed) => feed.authorId);
        const qualifiedUserIds = [...new Set(authorIds)];
        const taskCompletionArrays: TaskCompletionInterface[] = [];
        qualifiedUserIds.forEach((userId) => {
          taskCompletionArrays.push({
            id: undefined,
            userId: userId,
            taskId: task.id,
            achieveAt: new Date(),
            tokenEarned: task.token
          });
        });
        await TaskCompletionModel.bulkCreate(taskCompletionArrays);
        done();
      } catch (error) {
        console.log(error);
      }
    });
    this.queue.on("completed", (job) => {
      job.remove();
    });
  }

  public async scheduleJob() {
    const delay = (new Date(this.task.getDataValue("startDate"))).getTime() - (new Date()).getTime();
    const job = await this.queue.add({ taskId: this.task.getDataValue("id") });
    return job;
  }

  public async cancelJob() {
    const job = await this.queue.getJob(this.task.getDataValue("queueId"));
    if (job) job.remove();
  }
}

export default MaskTaskAsCompletedWorker;
