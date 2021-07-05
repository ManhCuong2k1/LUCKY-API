import { Router, Request, Response } from "express";
import { BrandInterface, BrandModel } from "@models/Brand";
import { GridInterface } from "@models/Transformers/Grid";
import _ from "lodash";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;
    const where = { status: query.status };

    const { rows, count } = await BrandModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAndCountAll({
      where: _.pickBy(where, (value) => value !== undefined),
      limit,
      offset,
    });

    const responseData: GridInterface<BrandInterface> = {
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
    const brandCreate: BrandInterface = req.body;

    const brand = await BrandModel.create(brandCreate);
    res.send({ data: brand });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const brand = await BrandModel.findByPk(req.params.id);
    const brandUpdate: BrandInterface = req.body;

    brand.name = brandUpdate.name;
    brand.isHome = brandUpdate.isHome;
    brand.avatar = brandUpdate.avatar;
    brand.status = brandUpdate.status;
    brand.description = brandUpdate.description;
    brand.slug = brandUpdate.slug;

    await brand.save();
    res.send({ data: brand });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const brand = await BrandModel.findByPk(req.params.id);

    res.send({ data: brand });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
