import { Router } from "express";
import { sendSuccess, sendError } from "@util/response";
import { TaskModel } from "@models/Task";
import { UserCheckinModel } from "@models/UserCheckin";
import { UserModel } from "@models/User";
import { TaskCompletionModel } from "@models/TaskCompletion";

const router = Router();

router.post("/:taskId", async (req, res) => {
  try {
    const currentUser = req.user || await UserModel.findByPk(1);
    const task = await TaskModel.scope([{ method: ["byType", TaskModel.TYPE_ENUM.CHECKIN] }])
      .findByPk(req.params.taskId);
    if (!task) return sendError(res, 404, "No data available");
    const taskRequirement = task.requirement as { checkpoints: { timeline: number; token: number; label: string }[]; isFlexible: boolean; isStrict: boolean };
    const checkinSequenceInitiation = await UserCheckinModel.getCheckinSequenceInitiation(task, currentUser.id);
    const currentStep = await UserCheckinModel.getCurrentCheckinStep(task, checkinSequenceInitiation);
    const currentCheckinProgressCount = await UserCheckinModel
      .scope([{ method: ["byTask", task.id] }, { method: ["byUser", currentUser.id] }]).count();
    if (!currentStep) return sendSuccess(res, {});
    if (currentStep - 1 > currentCheckinProgressCount) {
      await UserCheckinModel.skipCheckinMultipleTimes(task.id, currentUser.id, currentStep - currentCheckinProgressCount - 1);
    }
    const checkinRecord = await UserCheckinModel.create({ id: undefined, taskId: task.id, userId: currentUser.id, checkinAt: new Date()});
    if (!taskRequirement.isStrict || currentStep - 1 === currentCheckinProgressCount) {
      await TaskCompletionModel.completeCheckinTask(checkinRecord, taskRequirement.checkpoints[currentStep - 1].token);
    }
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

export default router;
