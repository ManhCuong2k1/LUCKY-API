import { Router, Request, Response } from "express";
import { CouponAdInterface, CouponAdModel } from "@models/CouponAd";
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

    const { rows, count } = await CouponAdModel.findAndCountAll({
      limit,
      offset,
    });

    const responseData: GridInterface<CouponAdInterface> = {
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
    const couponAdCreate: CouponAdInterface = req.body;

    const couponAd = await CouponAdModel.create(couponAdCreate);
    res.send({ data: couponAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const couponAd: any = await CouponAdModel.findByPk(req.params.id);
    const couponAdUpdate = req.body;

    CouponAdModel.UPDATABLE_PARAMETERS.forEach((param) => {
      couponAd[param] = couponAdUpdate[param];
    });

    await couponAd.save();
    res.send({ data: couponAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const couponAd = await CouponAdModel.findByPk(req.params.id);

    res.send({ data: couponAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
