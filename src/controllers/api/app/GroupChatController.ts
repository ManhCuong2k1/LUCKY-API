import { Router, Request, Response } from "express";
import {GroupChatModel} from "@models/GroupChat";
import {UserModel} from "@models/User";
import {ChatLogModel} from "@models/ChatLog";
import { Op } from "sequelize";

const router = Router();


/**
 * @openapi
 * /app/group-chats:
 *   get:
 *     tags:
 *      - "[App] group-chats"
 *     summary: Lấy thông tin danh sách group chat user đã tham gia
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
        const user: any = req.user;
        const groupChatUsers = await GroupChatModel.findAll({
            attributes: ["id", "name", "image", "description", "isActiveImage", "isActiveLink", "isPublished"],
            include: [
                {
                    model: UserModel,
                    as: "members",
                    where: {
                        id: user.id
                    },
                    attributes: [],
                    required: true
                }
            ]
        });

        return res.send(groupChatUsers);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});


/**
 * @openapi
 * /app/group-chats/{groupChatId}/chats:
 *   get:
 *     tags:
 *      - "[App] group-chats"
 *     summary: Lấy lịch sử chat trong nhóm từ id, dùng cho loading more trong chat box
 *     parameters:
 *      - name: "groupChatId"
 *        in: "path"
 *        description: "ID group chat"
 *        required: true
 *        type: "number"
 *      - name: "fromId"
 *        in: "query"
 *        description: "Lấy thêm lịch sử chat có Id < fromId"
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
router.get("/:groupChatId/chats", async (req: Request, res: Response) => {
    try {
        const fromId = req.query.fromId;
        const groupChatId = req.params.groupChatId;

        const chatLogs = await ChatLogModel.findAll({
            where: {
                groupChatId: groupChatId,
                id: {
                    [Op.lt]: fromId,
                }
            },
            limit: 15,
            order: [
                ["createdAt", "DESC"],
            ],
            include: [
                {
                    model: UserModel,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "username", "avatar", "nickname"]
                }
            ]
        });

        return res.send(chatLogs);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;