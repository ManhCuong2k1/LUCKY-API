import { Router, Request, Response } from "express";
import { NotificationInterface, NotificationModel } from "@models/Notification";
import { GridInterface } from "@models/Transformers/Grid";
import { CouponCategoryModel } from "@models/CouponCategory";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;

    const { rows, count } = await NotificationModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: CouponCategoryModel,
          attributes: ["title"],
          as: "couponCategory",
        },
      ],
    });

    const responseData: GridInterface<NotificationInterface> = {
      data: rows,
      page: page,
      pageSize: limit,
      total: count,
    };
    res.send(responseData);
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const notificationCreate: NotificationInterface = req.body;

    const notification = await NotificationModel.create(notificationCreate);
    res.send({ data: notification });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const notification: any = await NotificationModel.findByPk(req.params.id);
    const notificationUpdate = req.body;

    NotificationModel.UPDATABLE_PARAMETERS.forEach((param) => {
      notification[param] = notificationUpdate[param];
    });

    await notification.save();
    res.send({ data: notification });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const notification = await NotificationModel.findByPk(req.params.id);

    res.send({ data: notification });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
