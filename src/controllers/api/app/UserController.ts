import { Request, Response, Router } from "express";
import { UserInterface, UserModel } from "@models/User";
import { Sequelize } from "sequelize";
import { LotteryNotifyModel, GetUserNotify } from "@models/LotteryNotify";

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
            ]
        });

        res.send({ user: userData });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.get("/notify", async (req: Request, res: Response) => {
    try {
        const user: any = req.user;
        const limit: number = 18;

        const notifyUser = await GetUserNotify(user.id, limit);

        if(notifyUser == null || Object.keys(notifyUser).length == 0) {
            res.json({
                status: false,
                message: "Bạn Chưa có thông báo nào!"
              });
        }else {
            res.json({
                status: true,
                data: notifyUser,
                message: "Success!"
            });
        }
    }catch(e) {
        res.status(400).send({
            error: e.message
        });
    }
});


router.put("/notify/:id", async (req: Request, res: Response) => {
    try {
        const user: any = req.user;

        if(Object.keys(req.params.id).length) {
            const id = req.params.id;
            const notifyUser = await LotteryNotifyModel.findOne({
                where: {
                    id,
                    userId: user.id
                }
            });

            if(notifyUser == null || Object.keys(notifyUser).length == 0) {
                res.json({
                    status: false,
                    message: "Notify not found ID "+ id
                });
            }else {

                if(notifyUser.seen == LotteryNotifyModel.SEEN_ENUM.TRUE) { 
                    res.json({
                        status: false,
                        message: "This notice has been updated before!"
                    });
                }else {
                    notifyUser.seen = LotteryNotifyModel.SEEN_ENUM.TRUE;
                    notifyUser.save();
                    notifyUser.reload();
                    res.json({
                        status: true,
                        message: "Update successful!"
                    });
                }
            }
        }else {
            res.json({
                status: false,
                message: "Missing notify ID!"
            });
        }
    }catch(e) {
        res.status(400).send({
            error: e.message
        });
    }
});



export default router;
