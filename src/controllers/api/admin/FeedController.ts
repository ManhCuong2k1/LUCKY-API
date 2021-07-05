import { Router, Request, Response } from "express";
import { sendSuccess, sendError } from "@util/response";
import { FeedInterface, FeedModel } from "@models/Feed";
import { GridInterface } from "@models/Transformers/Grid";
import { FeedCommentModel } from "@models/FeedComment";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(!!query.pageSize ? query.pageSize.toString() : "20");
    const offset: number = (page - 1) * limit;
    const startDate: string = !!query.startDate ? query.startDate.toString() : (new Date()).toISOString();
    const endDate: string = !!query.endDate ? query.endDate.toString() : (new Date()).toISOString();

    delete query.page;
    delete query.pageSize;
    delete query.startDate;
    delete query.endDate;
    if (!query.status || !Object.values(FeedModel.STATUS_ENUM).includes(query.status.toString())) query.status = FeedModel.STATUS_ENUM.PUBLISH;
    const { rows, count } = await FeedModel
      .scope(["withBasicInfo",
        { method: ["byDateRange", startDate, endDate] },
        { method: ["byExtraQueries", query] }])
      .findAndCountAll({ limit, offset });

    const responseData: GridInterface<FeedInterface> = {
      data: rows,
      page: page,
      pageSize: limit,
      total: count
    };
    sendSuccess(res, { responseData });
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

/**
 * Get single feed by id
 */
router.get("/:feedId", async (req: Request, res: Response) => {
  try {
    const feedId = req.params.feedId;
    const feed = await FeedModel.scope(["withBasicInfo", { method: ["byId", feedId] }]).findOne();
    if (!feed) throw new Error("Not find feed by id: " + feedId);
    const feedComments = await feed.loadComments();
    feed.setDataValue("comments", feedComments);
    sendSuccess(res, { feed });
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

/**
 * API block and unblock comment in feed
 */
router.put("/:feedId/block-comment", async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const { isBlockComment } = req.body;

    const feed = await FeedModel.findOne({
      where: {
        id: feedId
      }
    });

    feed.isBlockComment = isBlockComment;
    await feed.save();

    return res.send({ isBlockComment });
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * API publish and un publish comment in feed
 */
router.put("/:feedId/publish", async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const { status } = req.body;

    const feed = await FeedModel.findOne({
      where: {
        id: feedId
      }
    });

    feed.status = status;
    await feed.save();
    return res.send({ status });
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * API xóa bài feed
 */
router.delete("/:feedId", async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const feed = await FeedModel.findOne({
      where: {
        id: feedId
      }
    });
    await feed.destroy();
    return res.send({ isDeleted: true });
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * API xóa bài comment trong bài feeds
 */
router.delete("/:feedId/comments/:commentId", async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const comment = await FeedCommentModel.findOne({
      where: {
        id: commentId,
        feedId
      }
    });
    await comment.destroy();
    return res.send({ isDeleted: true });
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

export default router;
