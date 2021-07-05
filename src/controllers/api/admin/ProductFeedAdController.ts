import { Router, Request, Response } from "express";
import {
  ProductFeedAdInterface,
  ProductFeedAdModel,
} from "@models/ProductFeedAd";
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

    const { rows, count } = await ProductFeedAdModel.findAndCountAll({
      limit,
      offset,
    });

    const responseData: GridInterface<ProductFeedAdInterface> = {
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
    const productFeedAdCreate: ProductFeedAdInterface = req.body;

    const productFeedAd = await ProductFeedAdModel.create(productFeedAdCreate);
    res.send({ data: productFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const productFeedAd: any = await ProductFeedAdModel.findByPk(req.params.id);
    const productFeedAdUpdate = req.body;

    ProductFeedAdModel.UPDATABLE_PARAMETERS.forEach((param) => {
      productFeedAd[param] = productFeedAdUpdate[param];
    });

    await productFeedAd.save();
    res.send({ data: productFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productFeedAd = await ProductFeedAdModel.findByPk(req.params.id);

    res.send({ data: productFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
