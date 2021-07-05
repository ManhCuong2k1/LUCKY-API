import FeedRestrictionRuleModel from "@models/FeedRestrictionRule";
import { ValidationError, ValidationErrorItem } from "sequelize";
import { Router } from "express";
import { sendSuccess, sendError } from "@util/response";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const rules = await FeedRestrictionRuleModel.getRules();
    sendSuccess(res, { rules });
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

router.patch("/", async (req, res) => {
  try {
    const params = req.parameters.permit(FeedRestrictionRuleModel.UPDATABLE_PARAMETERS).value();
    const rules = await FeedRestrictionRuleModel.getRules();
    await rules.update(params);
    await rules.reload();
    sendSuccess(res, { rules });
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});

export default router;
