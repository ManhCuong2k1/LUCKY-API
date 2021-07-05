import { Router, Request, Response } from "express";
import { HashTagModel } from "@models/HashTag";
const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const hashtags = await HashTagModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAll({ attributes: ["id", "name"] });

    res.send({ data: hashtags });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const hashtag = await HashTagModel.findByPk(req.params.id);

    res.send({ data: hashtag });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
