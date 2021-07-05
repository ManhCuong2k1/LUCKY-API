import { Router, Request, Response } from "express";
import { sendSuccess, sendError  } from "@util/response";
import { HashTagModel } from "@models/HashTag";
import { TaskCompletionModel } from "@models/TaskCompletion";
const router = Router();

router.post("/:hashtagId", async (req, res) => {
  try {
    const currentUser = req.user;
    const hashtag = await HashTagModel.findByPk(req.params.hashtagId);
    if (!hashtag) return sendError(res, 404, "No data available");
    const followingHashtag = await currentUser.addFollowingHashtags(hashtag);
    if (followingHashtag && followingHashtag.length) await TaskCompletionModel.completeHashtagFollowingTask(followingHashtag[0]);
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

router.delete("/:hashtagId", async (req, res) => {
  try {
    const currentUser = req.user;
    const hashtag = await HashTagModel.findByPk(req.params.hashtagId);
    if (!hashtag) return sendError(res, 404, "No data available");
    await currentUser.removeFollowingHashtags(hashtag);
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

export default router;
