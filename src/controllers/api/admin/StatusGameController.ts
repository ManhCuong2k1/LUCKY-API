import { Router, Request, Response } from "express";
import { StatusGamesModel } from "@models/LotteryStatusGames";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const statusGames = await StatusGamesModel.findAll();
        res.send({data: statusGames});
        
    } catch (error) {
        res.send(error);   
    }
});

router.put("/", async (req: Request, res: Response) => {
    try {
        const dataStatusGame = req.body;
        const data: any = await StatusGamesModel.findAll();

        data.forEach((element: any) => {
            const dataUpdate = dataStatusGame.find((e: any) =>  e.id === element.id);
            element.status = dataUpdate.status;
            element.save();
        });
        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

export default router;