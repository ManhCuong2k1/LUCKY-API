import { Router, Request, Response } from "express";
import {
  CouponCategoryModel,
  CouponCategoryInterface,
} from "@models/CouponCategory";
import { GridInterface } from "@models/Transformers/Grid";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;

    const { rows, count } = await CouponCategoryModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: CouponCategoryModel,
          attributes: ["id", "title"],
          as: "parent",
        },
      ],
    });

    const responseData: GridInterface<CouponCategoryInterface> = {
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
    const couponCategoryCreate: CouponCategoryInterface = req.body;

    const couponCategory = await CouponCategoryModel.create(
      couponCategoryCreate
    );
    res.send({ data: couponCategory });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const couponCategory: any = await CouponCategoryModel.findByPk(
      req.params.id
    );
    const couponCategoryUpdate = req.body;

    CouponCategoryModel.UPDATABLE_PARAMETERS.forEach((param) => {
      couponCategory[param] = couponCategoryUpdate[param];
    });

    await couponCategory.save();
    res.send({ data: couponCategory });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const couponCategorys = await CouponCategoryModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAll({
      attributes: ["id", "title"],
    });

    res.send({ data: couponCategorys });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const couponCategory = await CouponCategoryModel.findByPk(req.params.id);

    res.send({ data: couponCategory });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
