import { Router, Request, Response } from "express";
import { CategoryModel, CategoryInterface } from "@models/Category";
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

    const { rows, count } = await CategoryModel.scope([
      { method: ["bySearch", query.q] },
    ]).findAndCountAll({
      limit,
      offset,
    });

    const responseData: GridInterface<CategoryInterface> = {
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
    const categoryCreate: CategoryInterface = req.body;

    const category = await CategoryModel.create(categoryCreate);
    res.send({ data: category });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findByPk(req.params.id);
    const categoryUpdate: CategoryInterface = req.body;

    category.title = categoryUpdate.title;
    category.description = categoryUpdate.description;
    category.slug = categoryUpdate.slug;

    await category.save();
    res.send({ data: category });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const categories = await CategoryModel.scope([
      { method: ["bySearch", query.q] },
    ]).findAll({ attributes: ["id", "title"] });

    res.send({ data: categories });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findByPk(req.params.id);

    res.send({ data: category });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
