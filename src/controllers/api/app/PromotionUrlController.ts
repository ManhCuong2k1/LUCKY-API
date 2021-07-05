import { Router } from "express";
import { sendSuccess, sendError } from "@util/response";
import { PromotionUrlModel } from "@models/PromotionUrl";
import { TaskCompletionModel } from "@models/TaskCompletion";

const router = Router();

router.get("/:urlId", async (req, res) => {
  try {
    const currentUser = req.user;
    const promotionUrl = await PromotionUrlModel.findByPk(req.params.urlId);
    if (!promotionUrl) return sendError(res, 404, "No data available");
    await TaskCompletionModel.completePromotionUrlTask(promotionUrl.id, currentUser.id);
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

export default router;
