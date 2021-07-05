import { Router } from "express";
import { UserInterface, UserModel } from "@models/User";
import { Sequelize } from "sequelize";
import { FeedInterface, FeedModel } from "@models/Feed";
import { HashTagInterface, HashTagModel } from "@models/HashTag";
const router = Router();

/**
 * @openapi
 * /app/users/me:
 *   get:
 *     tags:
 *      - "[App] users"
 *     summary: Lấy thông tin tài khoản user
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/me", async (req, res, next) => {
    try {
        const user: any = req.user;

        const userData: UserInterface = await UserModel.findOne({
            where: { id: user.id },
            attributes: [
                "id", "username", "nickname", "firstName", "lastName", "email", "bio", "avatar", "gender", "dateOfBirth", "totalCoin", "totalGiftExchange",
                [
                    Sequelize.literal("(SELECT COUNT(*) FROM feeds AS c WHERE c.authorId = users.id)"),
                    "totalFeed"
                ]
            ],
            include: [
                {
                    model: HashTagModel,
                    as: "followHashTags",
                    attributes: ["id", "slug", "name", "image"]
                }
            ]
        });

        res.send({ user: userData });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

/**
 * @openapi
 * /app/users/me/feeds:
 *   get:
 *     tags:
 *      - "[App] users"
 *     summary: Lấy danh sách feeds của user
 *     responses:
 *       200:
 *         description: Return datas.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/me/feeds", async (req, res) => {
    try {
        const user: any = req.user;
        const feeds: FeedInterface[] = await FeedModel.findAll({
            where: { authorId: user.id },
            order: [
                ["createdAt", "DESC"],
            ],
            attributes: [
                "id", "content", "images", "hashTags", "background", "totalShare", "totalView", "createdAt", "isPublished",
                [
                    Sequelize.literal("(SELECT COUNT(*) FROM feed_comments AS c WHERE c.feedId = feeds.id)"),
                    "totalComment"
                ],
                [
                    Sequelize.literal("(SELECT COUNT(*) FROM feed_likes AS c WHERE c.feedId = feeds.id)"),
                    "totalLike"
                ]
            ]
        });
        res.send(feeds);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

/**
 * @openapi
 * /app/users/me/hash-tags:
 *   get:
 *     tags:
 *      - "[App] users"
 *     summary: Lấy danh sách hash tags user đã follow
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/me/hash-tags", async (req, res) => {
    try {
        const user: any = req.user;
        const hashTags: HashTagInterface[] = await HashTagModel.findAll({
            where: { isPublished: true },
            attributes: [
                "id", "slug", "name", "image",
                [
                    Sequelize.literal("(SELECT COUNT(*) FROM hash_tag_followers AS hf WHERE hf.hashTagId = hash_tags.id)"),
                    "totalFollowers"
                ]
            ],
            include: [
                {
                    model: UserModel,
                    as: "followers",
                    where: {
                        id: user.id
                    },
                    attributes: [],
                    required: false
                }
            ]
        });
        res.send(hashTags);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
