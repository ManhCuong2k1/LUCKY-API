import { Router, Request, Response } from "express";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { Op } from "sequelize";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {

    const lotteryOrder = await LotteryOrdersModel.findAll();

    res.send({ data: lotteryOrder });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:type", async (req: Request, res: Response) => {
    try {
        const typeGame = req.params.type;

        // const listOrderGame = await LotteryOrdersModel.findAll({
        //     where: {
        //         type: typeGame
        //     }
        // });
        // res.send({ data: listOrderGame });

        switch(typeGame) {
            case "keno":
                const listOrderGameKeno = await LotteryOrdersModel.findAll({
                    where: {
                        type: typeGame
                    }
                });
                res.send({ data: listOrderGameKeno });
                break;
            case "power":
                const listOrderGamePower = await LotteryOrdersModel.findAll({
                  where: {
                      type: typeGame
                  }
                });
                res.send({ data: listOrderGamePower });
                break;
            case "mega":
                const listOrderGameMega = await LotteryOrdersModel.findAll({
                  where: {
                      type: typeGame
                  }
                });
                res.send({ data: listOrderGameMega });
                break;
            case "plus-3d":
                const listOrderGamePlus = await LotteryOrdersModel.findAll({
                  where: {
                      type: typeGame
                  }
                });
                res.send({ data: listOrderGamePlus });
                break;
            case "3d":
                const listOrderGame3d = await LotteryOrdersModel.findAll({
                  where: {
                      type: typeGame
                  }
                });
                res.send({ data: listOrderGame3d });
                break;
            case "4d":
                const listOrderGame4d = await LotteryOrdersModel.findAll({
                  where: {
                      type: typeGame
                  }
                });
                res.send({ data: listOrderGame4d });
                break;
            default:
              // code block
        }
    } catch (e) {
        res.status(400).send({
            error: e.message,
        });
    }
});

router.post("/:id/images", upload.single("image"), async (req: Request, res: Response) => {
    try {
        const user = req.params.id;
        const orderItem = await LotteryOrdersModel.findByPk(user);
        console.log(orderItem);
        if (!req.file) throw new Error("No file to upload");
        const fileName = await saveFile(req.file);
        return res.send({ url: fileName });
    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
