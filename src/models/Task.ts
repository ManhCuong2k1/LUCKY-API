import {
  DataTypes, Model, ModelScopeOptions, ModelValidateOptions, ValidationError, Op
} from "sequelize";
import { ModelHooks } from "sequelize/types/lib/hooks";
import sequelize from "@database/connection";
import MarkTaskAsCompletedWorker from "../workers/MarkTaskAsCompletedWorker";

interface TaskInterface {
  id: number;
  type: string;
  isOneTimeOnly: boolean;
  startDate: Date;
  endDate: Date;
  token: number;
  requirement?: any[] | string | number | { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean };
  queueId?: string;
}

class TaskModel extends Model<TaskInterface>
  implements TaskInterface {
    // Attributes defination
    public id!: number;
    public type: string;
    public isOneTimeOnly: boolean;
    public startDate: Date;
    public endDate: Date;
    public token: number;
    public requirement?: any[] | string | number | { checkpoints: {timeline: number; token: number; label: string}[]; isFlexible: boolean; isStrict: boolean };
    public queueId?: string;
    static readonly TYPE_ENUM = {
      CHECKIN: "checkin",
      FEED_POSTING_ONCE: "feed_posting_once",
      FEED_POSTING_MULTIPLE_TIMES: "feed_posting_multiple_times",
      FEED_HASHTAG: "feed_hashtag",
      FIRST_COMMENTS: "first_comments",
      FIRST_LIKES: "first_likes",
      FEED_VIEWS: "feed_views",
      FEED_LIKES: "feed_likes",
      REFER: "refer",
      PROMOTION_URL: "promotion_url",
      HASHTAG_FOLLOWING: "hashtag_following"
    };
    static readonly ONE_TIME_ONLY_TYPES = ["checkin", "first_comments", "first_likes"]
    static readonly CREATEABLE_PARAMETERS = ["type", "startDate", "endDate", "token", "requirement",
      { "requirement": new Array(0) },
      { "requirement": [{ "checkpoints": ["timeline", "token", "label"]}, "isFlexible", "isStrict"]}];
    static readonly UPDATABLE_PARAMETERS = ["startDate", "endDate", , "token", "requirement",
      { "requirement": new Array(0) },
      { "requirement": [{ "checkpoints": ["timeline", "token", "label"] }, "isFlexible", "isStrict"] }];

    static readonly validations: ModelValidateOptions = {
      validType() {
        const validType = Object.values(TaskModel.TYPE_ENUM).includes(this.type);
        if (!validType) {
          throw new ValidationError("Phân loại task không hợp lệ");
        }
      }
    }

    static readonly hooks: Partial<ModelHooks> = {
      beforeValidate(record): Promise<void> | void {
        record.setDataValue("isOneTimeOnly", false);
        if (TaskModel.ONE_TIME_ONLY_TYPES.includes(record.getDataValue("type"))) {
          record.setDataValue("isOneTimeOnly", true);
        }
      },
      async afterSave(record): Promise<void> {
        if (record.getDataValue("startDate")
          && (record.getDataValue("type") === TaskModel.TYPE_ENUM.FIRST_COMMENTS
            || record.getDataValue("type") === TaskModel.TYPE_ENUM.FIRST_LIKES)) {
          const markTaskAsCompletedWorkerInstance = new MarkTaskAsCompletedWorker(record);
          if (record.getDataValue("queueId")) await markTaskAsCompletedWorkerInstance.cancelJob();
          const queue = await markTaskAsCompletedWorkerInstance.scheduleJob();
          await record.update({ queueId: queue.id }, { hooks: false });
        }
      }
    }

    static readonly scopes: ModelScopeOptions = {
      active: {
        where: {
          startDate: { [Op.lte]: new Date()},
          endDate: { [Op.gt]: new Date() }
        }
      },
      byType(type) {
        return {
          where: { type }
        };
      }
    }

    static async loadAvailableTask(type: string) {
      const tasks = await this.scope(["active", { method: ["byType", type] }]).findAll();
      return tasks;
    }
  }

const TaskDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: {
    type: DataTypes.ENUM({ values: Object.values(TaskModel.TYPE_ENUM) }),
    allowNull: false,
  },
  isOneTimeOnly: { type: DataTypes.BOOLEAN, allowNull: false },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  token: { type: DataTypes.INTEGER, allowNull:false, defaultValue: 0 },
  requirement: {
    type: DataTypes.TEXT,
    set(value: any[] | string | number | { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean }) {
      this.setDataValue("requirement", JSON.stringify(value));
    },
    get(): any[] | string | number | { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean } {
      if (!this.getDataValue("requirement")) return undefined;
      return JSON.parse(this.getDataValue("requirement"));
    }
  },
  queueId: { type: DataTypes.STRING, allowNull: true }
};

TaskModel.init(TaskDefine, {
  hooks: TaskModel.hooks,
  validate: TaskModel.validations,
  scopes: TaskModel.scopes,
  tableName: "tasks",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  TaskModel,
  TaskInterface
};
