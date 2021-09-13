import { Router, Request, Response } from "express";
import { SettingsModel } from "@models/LotterySettings";
import { authAdmin } from "../../../middleware/auth";
import { Op } from "sequelize";
import { ERROR_CODES } from "@util/constants";
const router = Router();

router.get("/", authAdmin, async (req: Request, res: Response) => {
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

        const rechargeStatus = await SettingsModel.findAll({
            where: {
                [Op.or]: [
                    { key: "recharge_momo_status" }, 
                    { key: "recharge_vnpay_status" },
                    { key: "recharge_bank_status" },
                ],
            }
        });
        res.send({data: {
            minLimit: dataLimitMin,
            maxLimit: dataLimitMax,
            storageFee: dataStorageFee,
            statusRecharge: rechargeStatus,
        }});
        
    } catch (error) {
        res.send(error);   
    }
});

router.get("/hotline", authAdmin, async (req: Request, res: Response) => {
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

router.post("/", authAdmin, async (req: Request, res: Response) => {
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
            {
                key: "recharge_momo_status",
                value: req.body.recharge_momo_status
            },
            {
                key: "recharge_vnpay_status",
                value: req.body.recharge_vnpay_status
            },
            {
                key: "recharge_bank_status",
                value: req.body.recharge_bank_status
            },
            
        ];
        const data = await SettingsModel.bulkCreate(limitExchange);
        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});
router.post("/hotline", authAdmin, async (req: Request, res: Response) => {
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

router.put("/hotline", authAdmin, async (req: Request, res: Response) => {
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

router.put("/", authAdmin, async (req: Request, res: Response) => {
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
            const dataStatusRecharge = dataSetting.statusRecharge.find((min: any) => min.id === element.id);
            
            if(dataUpdateMax) {
                element.value = dataUpdateMax.value;
            } else if(dataUpdateMin) {
                element.value = dataUpdateMin.value;
            } else if(dataStatusRecharge) {
                element.value = dataStatusRecharge.value;
            }else {
                element.value = dataSetting.storageFee.value;
            }
            element.save();
        });

        res.send(data);
    } catch (error) {
        res.send(error);   
    }
});

router.get("/bank", authAdmin, async (req: Request, res: Response) => {
    try {
        const dataBank = await SettingsModel.findAll({
            where: {
                key: "bank_rerchage_info"
            }
        });
        /* eslint-disable */
        if(dataBank) {
            const bankUser: any[] = []; 
            dataBank.forEach((e) =>  {
                const data = JSON.parse(e.value);
                
                const bankAccount = {
                    id: e.id,
                    bank_user: data.bank_user,
                    bank_name: data.bank_name,
                    bank_number: data.bank_number,
                    bank_branch: data.bank_branch
                };
                bankUser.push(bankAccount);
            });

            res.send(bankUser);
        } else {
            res.send({data: null});
        }
    } catch (error) {
        res.send(error);   
    }
});

router.get("/bank/:id", authAdmin, async (req: Request, res: Response) => {
    try {
        /* eslint-disable */
        const id = req.params.id;
        const dataBank = await SettingsModel.findByPk(id);
        if(dataBank) {
            const data = JSON.parse(dataBank.value);
                
            const bankAccount = {
                id: dataBank.id,
                bank_user: data.bank_user,
                bank_name: data.bank_name,
                bank_number: data.bank_number,
                bank_branch: data.bank_branch
            };

            res.send(bankAccount);
        } else {
            res.send({data: null});
        }
    } catch (error) {
        res.send(error);   
    }
});

router.put("/bank/:id", authAdmin, async (req: Request, res: Response) => {
    try {
        /* eslint-disable */
        const id = req.params.id;
        const {
            bank_user,
            bank_name,
            bank_number,
            bank_branch
        } = req.body;
        const dataBank = await SettingsModel.findByPk(id);
        
        if(dataBank) {
            const importDB:any = {
                bank_user,
                bank_name,
                bank_number,
                bank_branch,
            };
            const dataUpdate = JSON.stringify(importDB);
            dataBank.value = dataUpdate;
            await dataBank.save();
            res.send(dataBank);
        } else {
            res.send({data: null});
        }
    } catch (error) {
        res.send(error);   
    }
});

router.delete("/bank/:id", authAdmin, async (req: Request, res: Response) => {
    try {
        /* eslint-disable */
        const id = req.params.id;
        const dataBank = await SettingsModel.destroy({
            where: {
                id: id
            },
            force: true
        });
        res.send({status: true});
    } catch (error) {
        res.send(error);   
    }
});

router.post("/update-bank", async (req: Request, res: Response) => {
    try {
        /* eslint-disable */
        const {
            bank_user,
            bank_name,
            bank_number,
            bank_branch
        } = req.body;
        
        if(bank_user == "" || bank_user == "undefined" || bank_user == null) throw new Error(ERROR_CODES.SomeErrorsOccurredPleaseTryAgain);
        if(bank_name == "" || bank_name == "undefined" || bank_name == null) throw new Error(ERROR_CODES.SomeErrorsOccurredPleaseTryAgain);
        if(bank_number == "" || bank_number == "undefined" || bank_number == null) throw new Error(ERROR_CODES.SomeErrorsOccurredPleaseTryAgain);
        if(bank_branch == "" || bank_branch == "undefined" || bank_branch == null) throw new Error(ERROR_CODES.SomeErrorsOccurredPleaseTryAgain);

        const importDB:any = {
            bank_user,
            bank_name,
            bank_number,
            bank_branch
        }
        const dataDB:any = {
            key: "bank_rerchage_info",
            value: JSON.stringify(importDB)
        }
        await SettingsModel.create(dataDB);

        res.json({
            status: true,
            message: "Success"
        })
        /* eslint-enable */

    }catch(e) {
        console.log(e.message);
        res.json({code: e.message});
    }
});


export default router;