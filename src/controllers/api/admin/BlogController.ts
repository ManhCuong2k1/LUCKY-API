import { Router, Request, Response } from "express";
import { BlogModel, BlogInterface } from "@models/Blog";
import { CategoryModel } from "@models/Category";
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
    const where = { status: query.status, categoryId: query.categoryId };

    const { rows, count } = await BlogModel.scope([
      { method: ["bySearch", query.searchKey] },
      { method: ["byDateRange", query.startDate, query.endDate] },
    ]).findAndCountAll({
      where: _.pickBy(where, (value) => value !== undefined),
      limit,
      offset,
      include: [
        {
          model: CategoryModel,
          attributes: ["id", "title"],
          as: "category",
        },
      ],
    });

    const responseData: GridInterface<BlogInterface> = {
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
    const blogCreate: BlogInterface = req.body;

    const blog = await BlogModel.create(blogCreate);
    res.send({ data: blog });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const blog = await BlogModel.findByPk(req.params.id);
    const blogUpdate: BlogInterface = req.body;

    blog.title = blogUpdate.title;
    blog.brief = blogUpdate.brief;
    blog.slug = blogUpdate.slug;
    blog.content = blogUpdate.content;
    blog.avatar = blogUpdate.avatar;
    blog.categoryId = blogUpdate.categoryId;
    blog.status = blogUpdate.status;

    await blog.save();
    res.send({ data: blog });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await BlogModel.findByPk(req.params.id);

    res.send({ data: blog });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
