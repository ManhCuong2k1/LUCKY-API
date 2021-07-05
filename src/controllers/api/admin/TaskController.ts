import { TaskInterface, TaskModel } from "@models/Task";
import { ValidationError, ValidationErrorItem } from "sequelize";
import { Router } from "express";
import { sendSuccess, sendError } from "@util/response";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const tasks = await TaskModel.findAll();
    sendSuccess(res, { tasks });
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

router.get("/:taskId", async (req, res) => {
  try {
    const id = req.params.taskId;
    const task = await TaskModel.findByPk(id);
    if (!task) return sendError(res, 404, "No data available");
    sendSuccess(res, { task });
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const params: TaskInterface  = req.parameters.permit(TaskModel.CREATEABLE_PARAMETERS).value();
    const task = await TaskModel.create(params);
    sendSuccess(res, { task });
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});

export default router;
