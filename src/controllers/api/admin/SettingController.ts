import { Router, Request, Response } from "express";
import { SettingsModel } from "@models/LotterySettings";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const dataExchangeLimit = await SettingsModel.findOne({
            where: {
                key: "limit_exchange"
            }
        });

        res.send({data: dataExchangeLimit});
    } catch (error) {
        res.send(error);   
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const dataExchangeLimit = await SettingsModel.findAll({
            where: {
                key: "limit_exchange"
            }
        });

        const limitExchange: any = {
            key: "limit_exchange",
            value: req.body.value
        };

        if(dataExchangeLimit.length === 0) {
            const data = await SettingsModel.create(limitExchange);
            res.send(data);
        } else {
            res.status(400).send("Cannot create because this field already exists");
        }
    } catch (error) {
        res.send(error);   
    }
});

router.put("/", async (req: Request, res: Response) => {
    try {
        const data = req.body.value;
        const limitExchange = await SettingsModel.findOne({
            where: {
                key: "limit_exchange"
            }
        });
        if(limitExchange) {
            limitExchange.value = data;
            await limitExchange.save();
            res.send(limitExchange);
        } else {
            res.status(400).send("Cannot find limitExchange");
        }
        
    } catch (error) {
        res.send(error);   
    }
});

export default router;