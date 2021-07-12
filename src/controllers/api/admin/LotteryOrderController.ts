import { Router, Request, Response } from "express";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { Op } from "sequelize";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";
import { resolve } from "bluebird";
const router = Router();

const getdata = async (typeGame: any) => {
    const data = await LotteryOrdersModel.findAll({
        where: {
            type: typeGame
        }
    });
    // console.log(data.dataValues);
    
    return data;
};

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
        let listGameType: any = [];
        
        switch(typeGame) {
            case "keno":
                listGameType = await getdata(typeGame);
                break;
            case "power":
                listGameType = await getdata(typeGame);
                break;
            case "mega":
                listGameType = await getdata(typeGame);
                break;
            case "plus3d":
                listGameType = await getdata(typeGame);
                break;
            case "3d":
                listGameType = await getdata(typeGame);
                break;
            case "4d":
                listGameType = await getdata(typeGame);
                break;
            default:
                res.json({
                    status: false,
                    message: "error"
                });
        }
        res.send({ data: listGameType });
    } catch (e) {
        res.status(400).send({
            error: e.message,
        });
    }
});

router.post("/:id/images", upload.array("images"), async (req: Request, res: Response) => {
    try {
        const user = req.params.id;
        const orderItem = await LotteryOrdersModel.findByPk(user);
        if (!req.files) throw new Error("No file to upload");
        
        const data = Object.values(req.files);
        const objectData: any = [];        
        await data.forEach(async (element: any) => {            
            const fileName = await saveFile(element);
            objectData.push(fileName);
            orderItem.itemImages = JSON.stringify(objectData);
            orderItem.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
            await orderItem.save();
            res.send({ itemImages: orderItem.itemImages , orderStatus: orderItem.orderStatus});
        });
    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
