import { Router, Request, Response } from "express";
import { SettingsModel } from "@models/LotterySettings";
import { Op } from "sequelize";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const dataLimitMin = await SettingsModel.findAll({
            where: {
                [Op.or]: [
                    { key: "exchange_local_min" }, 
                    { key: "exchange_momo_min" },
                    { key: "exchange_vnpay_min" },
                    { key: "exchange_bank_min" },
                    { key: "recharge_momo_min" },
                    { key: "recharge_vnpay_min" },
                ],
            }
        });

        const dataLimitMax = await SettingsModel.findAll({
            where: {
                [Op.or]: [
                    { key: "exchange_local_max" }, 
                    { key: "exchange_momo_max" },
                    { key: "exchange_vnpay_max" },
                    { key: "exchange_bank_max" },
                    { key: "recharge_momo_max" },
                    { key: "recharge_vnpay_max" },
                ],
            }
        });

        const dataStorageFee = await SettingsModel.findOne({
            where: {
                [Op.or]: [
                    { key: "ticket_storage_fee" }, 
                ],
            }
        });
        res.send({data: {
            minLimit: dataLimitMin,
            maxLimit: dataLimitMax,
            storageFee: dataStorageFee,
        }});
        
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
        
        data.forEach((element: any) => {
            const dataUpdateMax = dataSetting.maxLimit.find((max: any) => max.id === element.id);
            const dataUpdateMin = dataSetting.minLimit.find((min: any) => min.id === element.id);
            
            if(dataUpdateMax) {
                element.value = dataUpdateMax.value;
            } else if(dataUpdateMin) {
                element.value = dataUpdateMin.value;
            } else {
                element.value = dataSetting.storageFee.value;
            }
            element.save();
        });

        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

export default router;