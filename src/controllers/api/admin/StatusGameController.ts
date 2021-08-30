import { Router, Request, Response } from "express";
import { StatusGamesModel } from "@models/LotteryStatusGames";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const statusGames = await StatusGamesModel.findAll();
        console.log(statusGames);
        
        
        if(statusGames.length !== 0) {
            const result: any = {
                "keno": statusGames[0].status,
                "power": statusGames[1].status,
                "mega": statusGames[2].status,
                "max3d": statusGames[3].status,
                "max3dplus": statusGames[4].status,
                "max4d": statusGames[5].status,
                "compute123": statusGames[6].status,
                "compute636": statusGames[7].status,
                "loto234": statusGames[8].status,
                "loto2": statusGames[9].status,
                "loto3": statusGames[10].status,
                "loto5": statusGames[11].status,
                "kienthiet": statusGames[12].status,
            };
            
            res.send({data: result});
        } else {
            res.send({data: null});
        }
        
    } catch (error) {
        res.send(error);   
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const statusGame: any = [
            {
                type: StatusGamesModel.GAME_ENUM.KENO,
                status: req.body.keno
            },
            {
                type: StatusGamesModel.GAME_ENUM.POWER,
                status: req.body.power
            },
            {
                type: StatusGamesModel.GAME_ENUM.MEGA,
                status: req.body.mega
            },
            {
                type: StatusGamesModel.GAME_ENUM.MAX3D,
                status: req.body.max3d
            },
            {
                type: StatusGamesModel.GAME_ENUM.MAX3DPLUS,
                status: req.body.max3dplus
            },
            {
                type: StatusGamesModel.GAME_ENUM.MAX4D,
                status: req.body.max4d
            },
            {
                type: StatusGamesModel.GAME_ENUM.COMPUTE123,
                status: req.body.compute123
            },
            {
                type: StatusGamesModel.GAME_ENUM.COMPUTE636,
                status: req.body.compute636
            },
            {
                type: StatusGamesModel.GAME_ENUM.LOTO234,
                status: req.body.loto234
            },
            {
                type: StatusGamesModel.GAME_ENUM.LOTO2,
                status: req.body.loto2
            },
            {
                type: StatusGamesModel.GAME_ENUM.LOTO3,
                status: req.body.loto3
            },
            {
                type: StatusGamesModel.GAME_ENUM.LOTO5,
                status: req.body.loto5
            },
            {
                type: StatusGamesModel.GAME_ENUM.KIENTHIET,
                status: req.body.kienthiet
            },
            
        ];
        const data = await StatusGamesModel.bulkCreate(statusGame);
        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

router.put("/", async (req: Request, res: Response) => {
    try {
        const dataStatusGame = req.body;
        const data: any = await StatusGamesModel.findAll();

        if(data) {
            data[0].status = dataStatusGame.keno;
            data[1].status = dataStatusGame.power;
            data[2].status = dataStatusGame.mega;
            data[3].status = dataStatusGame.max3d;
            data[4].status = dataStatusGame.max3dplus;
            data[5].status = dataStatusGame.max4d;
            data[6].status = dataStatusGame.compute123;
            data[7].status = dataStatusGame.compute636;
            data[8].status = dataStatusGame.loto234;
            data[9].status = dataStatusGame.loto2;
            data[10].status = dataStatusGame.loto3;
            data[11].status = dataStatusGame.loto5;
            data[12].status = dataStatusGame.kienthiet;
            
            for(let i = 0; i < data.length; i++) {
                await data[i].save();
            }
    
            res.send(data);
        } else {
            res.send({
                status: false,
                message: "Cannot find data"
            });
        }
        
       
    } catch (error) {
        res.send(error);   
    }
});

export default router;