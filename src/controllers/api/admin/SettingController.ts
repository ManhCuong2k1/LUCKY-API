import { Router, Request, Response } from "express";
import { SettingsModel } from "@models/LotterySettings";
import { Op } from "sequelize";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const dataExchangeLimit = await SettingsModel.findAll({
            where: {
                key : {
                    [Op.ne]: "hot_line"
                }
            }
        });
        console.log(dataExchangeLimit);
        
        if(dataExchangeLimit.length !== 0) {
            const result: any = {
                "exchange_local_min": dataExchangeLimit[0].value,
                "exchange_momo_min": dataExchangeLimit[1].value,
                "exchange_vnpay_min": dataExchangeLimit[2].value,
                "exchange_bank_min": dataExchangeLimit[3].value,
                "recharge_momo_min": dataExchangeLimit[4].value,
                "recharge_vnpay_min": dataExchangeLimit[5].value,
                "exchange_local_max": dataExchangeLimit[6].value,
                "exchange_momo_max": dataExchangeLimit[7].value,
                "exchange_vnpay_max": dataExchangeLimit[8].value,
                "exchange_bank_max": dataExchangeLimit[9].value,
                "recharge_momo_max": dataExchangeLimit[10].value,
                "recharge_vnpay_max": dataExchangeLimit[11].value,
                "ticket_storage_fee": dataExchangeLimit[12].value,
            };
            
            res.send({data: result});
        } else {
            res.send({data: null});
        }
        
    } catch (error) {
        res.send(error);   
    }
});

router.get("/hotline", async (req: Request, res: Response) => {
    try {
        const dataHotline = await SettingsModel.findOne({
            where: {
                key: "hot_line"
            }
        });
        if(dataHotline) {
            res.send({data: { "hot_line" : dataHotline.value}});
        } else {
            res.send({data: null});
        }
    } catch (error) {
        res.send(error);   
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const limitExchange: any = [
            {
                key: "exchange_local_min",
                value: req.body.exchange_local_min
            },
            {
                key: "exchange_momo_min",
                value: req.body.exchange_momo_min
            },
            {
                key: "exchange_vnpay_min",
                value: req.body.exchange_vnpay_min
            },
            {
                key: "exchange_bank_min",
                value: req.body.exchange_bank_min
            },
            {
                key: "recharge_momo_min",
                value: req.body.recharge_momo_min
            },
            {
                key: "recharge_vnpay_min",
                value: req.body.recharge_vnpay_min
            },
            {
                key: "exchange_local_max",
                value: req.body.exchange_local_max
            },
            {
                key: "exchange_momo_max",
                value: req.body.exchange_momo_max
            },
            {
                key: "exchange_vnpay_max",
                value: req.body.exchange_vnpay_max
            },
            {
                key: "exchange_bank_max",
                value: req.body.exchange_bank_max
            },
            {
                key: "recharge_momo_max",
                value: req.body.recharge_momo_max
            },
            {
                key: "recharge_vnpay_max",
                value: req.body.recharge_vnpay_max
            },
            {
                key: "ticket_storage_fee",
                value: req.body.ticket_storage_fee
            },
            
        ];
        const data = await SettingsModel.bulkCreate(limitExchange);
        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});
router.post("/hotline", async (req: Request, res: Response) => {
    try {
        const hotLine: any = 
            {
                key: "hot_line",
                value: req.body.hot_line
            };
        const data = await SettingsModel.create(hotLine);
        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

router.put("/hotline", async (req: Request, res: Response) => {
    try {
        const hotline = req.body.hot_line;
        const data = await SettingsModel.findOne({
            where: {
                key: "hot_line"
            }
        });
        if(data) {
            data.value = hotline;
            data.save();
            res.send(data);
        } else {
            res.status(400).send("Cannot find hotline");
        }
    } catch (error) {
        res.send(error);   
    }
});

router.put("/", async (req: Request, res: Response) => {
    try {
        const dataSetting = req.body;
        const data: any = await SettingsModel.findAll({
            where: {
                key : {
                    [Op.ne]: "hot_line"
                }
            }
        });
        
        data[0].value = dataSetting.exchange_local_min;
        data[1].value = dataSetting.exchange_momo_min;
        data[2].value = dataSetting.exchange_vnpay_min;
        data[3].value = dataSetting.exchange_bank_min;
        data[4].value = dataSetting.recharge_momo_min;
        data[5].value = dataSetting.recharge_vnpay_min;
        data[6].value = dataSetting.exchange_local_max;
        data[7].value = dataSetting.exchange_momo_max;
        data[8].value = dataSetting.exchange_vnpay_max;
        data[9].value = dataSetting.exchange_bank_max;
        data[10].value = dataSetting.recharge_momo_max;
        data[11].value = dataSetting.recharge_vnpay_max;
        data[12].value = dataSetting.ticket_storage_fee;
        
        for(let i = 0; i < data.length; i++) {
            await data[i].save();
        }

        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

export default router;