import { Router, Request, Response } from "express";
import { BannerFeedAdInterface, BannerFeedAdModel } from "@models/BannerFeedAd";
import { HashTagModel } from "@models/HashTag";
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

    const { rows, count } = await BannerFeedAdModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: HashTagModel,
          as: "hashtag",
          attributes: ["name"],
        }
      ]
    });

    const responseData: GridInterface<BannerFeedAdInterface> = {
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
    const bannerFeedAdCreate: BannerFeedAdInterface = req.body;

    const bannerFeedAd = await BannerFeedAdModel.create(bannerFeedAdCreate);
    res.send({ data: bannerFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const bannerFeedAd: any = await BannerFeedAdModel.findByPk(req.params.id);
    const bannerFeedAdUpdate = req.body;

    BannerFeedAdModel.UPDATABLE_PARAMETERS.forEach((param) => {
      bannerFeedAd[param] = bannerFeedAdUpdate[param];
    });

    await bannerFeedAd.save();
    res.send({ data: bannerFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bannerFeedAd = await BannerFeedAdModel.findByPk(req.params.id);

    res.send({ data: bannerFeedAd });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
