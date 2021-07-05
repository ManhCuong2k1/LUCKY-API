import dayjs from "dayjs";
import { Model, DataTypes, ModelScopeOptions } from "sequelize";
import sequelize from "@database/connection";
import { TaskModel } from "./Task";

interface UserCheckinInterface {
  id: number;
  userId: number;
  taskId: number;
  checkinAt?: Date;
}

class UserCheckinModel extends Model<UserCheckinInterface> implements UserCheckinInterface {
  public id!: number;
  public userId!: number;
  public taskId!: number;
  public checkinAt?: Date;

  static readonly scopes: ModelScopeOptions = {
    byTask(taskId) {
      return { where: { taskId } };
    },
    byUser(userId) {
      return { where: { userId } };
    },
  }

  static async getCheckinSequenceInitiation(task: TaskModel, userId: number) {
    const taskRequirement = task.requirement as { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean };
    if (!taskRequirement.isFlexible) return dayjs(task.startDate).format();
    const currentCheckinProgress = await this.scope([{ method: ["byTask", task.id] }, { method: ["byUser", userId] }]).findAll();
    if (!currentCheckinProgress.length) return dayjs().startOf("day").format();
    return dayjs(currentCheckinProgress[0].checkinAt).startOf("day").format();
  };

  static async getCurrentCheckinStep(task: TaskModel, initiation: string) {
    let currentStep: number;
    let checkpointStart = dayjs(initiation);
    const currentTime = dayjs(new Date());
    const taskRequirement = task.requirement as { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean };
    const { checkpoints } = taskRequirement;
    if (!checkpoints) return;
    checkpoints.forEach((checkpoint, index) => {
      const checkpointEnd = checkpointStart.add(checkpoint.timeline, "hours");
      if (checkpointStart.isBefore(currentTime) && currentTime.isBefore(checkpointEnd)) {
        currentStep = index + 1;
      }
      checkpointStart = checkpointEnd;
    });
    return currentStep;
  };

  static async skipCheckinMultipleTimes(taskId: number, userId: number, times: number) {
    const checkinArrays: UserCheckinInterface[] = [];
    for (let i = 0; i < times; i++) {
      checkinArrays.push({ id: undefined, userId, taskId });
    }
    await this.bulkCreate(checkinArrays);
  }
}

const UserCheckinDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  checkinAt: { type: DataTypes.DATE, allowNull: true },
};

UserCheckinModel.init(UserCheckinDefine, {
  scopes: UserCheckinModel.scopes,
  tableName: "user_checkins",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  UserCheckinModel,
  UserCheckinInterface
};
