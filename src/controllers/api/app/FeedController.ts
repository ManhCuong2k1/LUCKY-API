import { Request, Response, Router } from "express";
import { Transaction, ValidationError, ValidationErrorItem } from "sequelize";
import { sendSuccess, sendError } from "@util/response";
import { UserModel } from "@models/User";
import { HashTagModel } from "@models/HashTag";
import { FeedInterface, FeedModel } from "@models/Feed";
import { GridInterface } from "@models/Transformers/Grid";
import { FeedCommentInterface, FeedCommentModel } from "@models/FeedComment";
import { FeedLikeModel } from "@models/FeedLike";
import { CommentLikeModel } from "@models/CommentLike";
import { TaskCompletionModel } from "@models/TaskCompletion";
import { extract } from "@util/hashTag";
import sequelize from "@database/connection";

const router = Router();

/**
 * @openapi
 * /app/feeds:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: Lấy danh sách feeds mới nhất
 *     parameters:
 *      - name: "page"
 *        in: "query"
 *        description: "Lấy danh sách theo page"
 *        required: true
 *        type: "number"
 *      - name: "pageSize"
 *        in: "query"
 *        description: "Số lượng feed muốn lấy trong một page"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
    const limit: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
    const offset: number = (page - 1) * limit;
    const { rows, count } = await FeedModel.scope("withBasicInfo").findAndCountAll({ limit, offset });
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
 * @openapi
 * /app/feeds/{feedId}:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: Lấy chi tiết một feed theo id
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
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
 * @openapi
 * /app/feeds:
 *   post:
 *     tags:
 *      - "[App] feeds"
 *     summary: API tạo mới feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin feed"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *              description: "Nội dung feed"
 *            image:
 *              type: "string"
 *              description: "Hình ảnh upload nếu có (1 feed chỉ cho phép 1 ảnh)"
 *     responses:
 *       200:
 *         description: Return feed data
 *       400:
 *         description: Create new feed failed
 *     security:
 *      - Bearer: []
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const feedAttributes: FeedInterface = req.body;
    feedAttributes.authorId = author.id;
    const slugsList = extract(feedAttributes.content, { unique: true, type: "#", symbol: false });
    const hashtags = await HashTagModel.scope([{ method: ["bySlug", slugsList] }]).findAll();
    const feed = await FeedModel.build(feedAttributes);
    if ((await feed.isValidContent())) {
      feed.status = FeedModel.STATUS_ENUM.PUBLISH;
    } else {
      feed.status = FeedModel.STATUS_ENUM.DRAFT;
    }
    await sequelize.transaction(async (transaction: Transaction) => {
      await feed.save({ transaction });
      await feed.addFeedHashTags(hashtags, { transaction });
    });
    TaskCompletionModel.completeFeedPostingOnceTask(feed);
    TaskCompletionModel.completeFeedPostingMultipleTimesTask(feed);
    TaskCompletionModel.completeFeedPostingWithHashtag(feed);
    await feed.reload({
      include: [
        {
          model: UserModel,
          as: "author",
          attributes: ["nickname", "name", "avatar"]
        }
      ]
    });
    sendSuccess(res, { feed });
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}:
 *   put:
 *     tags:
 *      - "[App] feeds"
 *     summary: API cập nhật feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin feed"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *            image:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return feed data
 *       400:
 *         description: Update feed failed
 *     security:
 *      - Bearer: []
 */
router.put("/:feedId", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const updateData: FeedInterface = req.body;
    const feedId: number = parseInt(req.params.feedId.toString());
    const feed = await FeedModel.findOne({ where: { id: feedId, authorId: author.id } });
    if (!feed) throw new Error("Not found feed by you");
    feed.content = updateData.content;
    const slugsList = extract(updateData.content, { unique: true, type: "#", symbol: false });
    const hashtags = await HashTagModel.scope([{ method: ["bySlug", slugsList] }]).findAll();
    feed.image = updateData.image;
    await sequelize.transaction(async (transaction: Transaction) => {
      await feed.save({ transaction });
      await feed.setFeedHashTags(hashtags, { transaction });
    });
    await feed.reload({
      include: [
        {
          model: UserModel,
          as: "author",
          attributes: ["nickname", "firstName", "lastName", "avatar"]
        }
      ]
    });
    sendSuccess(res, { feed });
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});


/**
 * @openapi
 * /app/feeds/{feedId}/like:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: API like & dislike feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: Return true is liked, false is disliked
 *       400:
 *         description: Like feed failed
 *     security:
 *      - Bearer: []
 */
router.get("/:feedId/like", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const feedId: number = parseInt(req.params.feedId.toString());
    const feed = await FeedModel.findOne({ where: { id: feedId } });
    if (!feed) throw new Error("Not found feed");
    const liked = await FeedLikeModel.findOne({ where: { userId: author.id, feedId } });
    if (liked) {
      await liked.destroy({ force: true });
      return sendSuccess(res, { liked: false });
    } else {
      await FeedLikeModel.create({ userId: author.id, feedId });
      TaskCompletionModel.completeFeedLikeTask(feed);
      TaskCompletionModel.completeFirstReachedOfLikesTask(feed);
      return sendSuccess(res, { liked: true });
    }
  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}/increase-view:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: API tăng lượt view cho feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: True
 *       400:
 *         description: False
 *     security:
 *      - Bearer: []
 */
router.get("/:feedId/increase-view", async (req: Request, res: Response) => {
  try {
    const feedId: number = parseInt(req.params.feedId.toString());
    const feed = await FeedModel.findOne({ where: { id: feedId } });
    if (!feed) throw new Error("Not found feed");

    feed.totalView = feed.totalView + 1;
    await feed.save();
    await TaskCompletionModel.completeFeedViewTask(feed);
    sendSuccess(res, { });

  } catch (error) {
    sendError(res, 400, error.message, error);
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}/increase-share:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: API tăng lượt share cho feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: True
 *       400:
 *         description: False
 *     security:
 *      - Bearer: []
 */
router.get("/:feedId/increase-share", async (req: Request, res: Response) => {
  try {
    const feedId: number = parseInt(req.params.feedId.toString());
    const feed = await FeedModel.findOne({ where: { id: feedId } });
    if (!feed) throw new Error("Not found feed");

    feed.totalShare = feed.totalShare + 1;
    await feed.save();
    res.send({ success: true });
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});


/**
 * @openapi
 * /app/feeds/{feedId}/comments:
 *   post:
 *     tags:
 *      - "[App] feeds"
 *     summary: API thêm mới comment cho feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin comment"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *            image:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return comment data
 *       400:
 *         description: Add comment failed
 *     security:
 *      - Bearer: []
 */
router.post("/:feedId/comments", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const comment: FeedCommentInterface = req.body;
    const feedId = parseInt(req.params.feedId);
    const feed = await FeedModel.findOne({ where: { id: feedId } });
    if (!feed) throw new Error("Not found feed");
    comment.feedId = feedId;
    comment.authorId = author.id;
    const savedComment: FeedCommentInterface = await FeedCommentModel.create(comment);
    TaskCompletionModel.completeFirstReachedOfCommentsTask(feed);
    res.send(savedComment);
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}/comments/{commentId}:
 *   put:
 *     tags:
 *      - "[App] feeds"
 *     summary: API cập nhật comment trong feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *      - name: "commentId"
 *        in: "path"
 *        description: "Comment Id"
 *        required: true
 *        type: "number"
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin comment"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *            image:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return comment data.
 *       400:
 *         description: Update comment failed
 *     security:
 *      - Bearer: []
 */
router.put("/:feedId/comments/:commentId", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const updateData: FeedCommentInterface = req.body;
    const commentId = parseInt(req.params.commentId.toString());
    const comment = await FeedCommentModel.findOne({ where: { id: commentId, authorId: author.id } });
    if (!comment) throw new Error("Not found comment by you");
    comment.image = updateData.image;
    comment.content = updateData.content;

    await comment.save();
    await comment.reload();
    res.send(comment);
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}/comments/{commentId}/reply:
 *   post:
 *     tags:
 *      - "[App] feeds"
 *     summary: API reply comment trong feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *      - name: "commentId"
 *        in: "path"
 *        description: "Comment Id"
 *        required: true
 *        type: "number"
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin comment"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *            image:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return comment data
 *       400:
 *         description: Add comment failed
 *     security:
 *      - Bearer: []
 */
router.post("/:feedId/comments/:commentId/reply", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const comment: FeedCommentInterface = req.body;
    const feedId = parseInt(req.params.feedId);
    const commentId = parseInt(req.params.commentId);
    comment.feedId = feedId;
    comment.authorId = author?.id || 1;
    comment.feedCommentId = commentId;
    const savedComment: FeedCommentInterface = await FeedCommentModel.create(comment);
    res.send(savedComment);
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

/**
 * @openapi
 * /app/feeds/{feedId}/comments/{commentId}/like:
 *   get:
 *     tags:
 *      - "[App] feeds"
 *     summary: API tăng lượt share cho feed
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "feedId"
 *        in: "path"
 *        description: "Feed Id"
 *        required: true
 *        type: "number"
 *      - name: "commentId"
 *        in: "path"
 *        description: "Comment Id"
 *        required: true
 *        type: "number"
 *     responses:
 *       200:
 *         description: True
 *       400:
 *         description: False
 *     security:
 *      - Bearer: []
 */
router.get("/:feedId/comments/:commentId/like", async (req: Request, res: Response) => {
  try {
    const author: any = req.user;
    const commentId: number = parseInt(req.params.commentId.toString());

    const liked = await CommentLikeModel.findOne({ where: { userId: author.id, feedCommentId: commentId } });
    if (liked) {
      await liked.destroy({ force: true });

      return res.send({ liked: false });
    } else {
      await CommentLikeModel.create({ userId: author.id, feedCommentId: commentId });
      return res.send({ liked: true });
    }
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
});

export default router;
