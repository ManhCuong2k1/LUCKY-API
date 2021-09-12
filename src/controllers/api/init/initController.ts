/* eslint-disable @typescript-eslint/camelcase */

import { Response, Request, Router } from "express";
import dotenv from "dotenv";
import { Banner } from "@models/Banner";
import { getSettings, SettingsModel } from "@models/LotterySettings";


dotenv.config();
const router = Router();


router.get("/app-settings", async (req: Request, res: Response) => {
    try {

        interface ExportInterface {
            [key: string]: any;
        }
        const dataExport: ExportInterface = {};

        dataExport.appver = process.env.APP_VERSION || "1.0.0";
        dataExport.host = process.env.HOST;
        dataExport.images = {};
        dataExport.images.service_export = process.env.HOST_IMAGES_EXPORT_URL;
        const bannerDB = await Banner.findAll({
            order: [["index", "ASC"]],
        });

        dataExport.banner = [];
        bannerDB.forEach((banner: any) => {
            dataExport.banner.push({
                id: banner.id,
                image: process.env.HOST_IMAGES_EXPORT_URL + banner.image,
                type: banner.type,
                index: banner.index
            });
        });

        dataExport.bank_rerchage_info = [];
        const bankDB = await SettingsModel.findAll({
            where: {
                key: "bank_rerchage_info"
            },
            order: [["id", "ASC"]]
        });

        bankDB.forEach((bank: any) => {
            const dataBank = JSON.parse(bank.value);
            dataExport.bank_rerchage_info.push({
                id: bank.id,
                bank_user: dataBank.bank_user,
                bank_name: dataBank.bank_name,
                bank_number: dataBank.bank_number,
                bank_branch: dataBank.bank_branch,
            });
        });

        dataExport.rechargeStatus = {};
        dataExport.rechargeStatus.momo = JSON.parse(await getSettings("recharge_momo_status"));
        dataExport.rechargeStatus.vnpay = JSON.parse(await getSettings("recharge_vnpay_status"));
        dataExport.rechargeStatus.bank = JSON.parse(await getSettings("recharge_bank_status"));


        dataExport.exchange = {};
        dataExport.exchange.local_min = Number(await getSettings("exchange_local_min"));
        dataExport.exchange.local_max = Number(await getSettings("exchange_local_max"));
        dataExport.exchange.momo_min = Number(await getSettings("exchange_momo_min"));
        dataExport.exchange.momo_max = Number(await getSettings("exchange_momo_max"));
        dataExport.exchange.vnpay_min = Number(await getSettings("exchange_vnpay_min"));
        dataExport.exchange.vnpay_max = Number(await getSettings("recharge_vnpay_max"));
        dataExport.exchange.bank_min = Number(await getSettings("exchange_bank_min"));
        dataExport.exchange.bank_max = Number(await getSettings("exchange_bank_max"));

        dataExport.recharge = {};
        dataExport.recharge.momo_min = Number(await getSettings("recharge_momo_min"));
        dataExport.recharge.momo_max = Number(await getSettings("recharge_momo_max"));
        dataExport.recharge.vnpay_min = Number(await getSettings("recharge_vnpay_min"));
        dataExport.recharge.vnpay_max = Number(await getSettings("recharge_vnpay_max"));

        dataExport.ticket = {};
        dataExport.ticket.ticket_storage_fee = Number(await getSettings("ticket_storage_fee"));

        dataExport.support = {};
        dataExport.support.phone = await getSettings("hot_line");


        res.json({
            status: true,
            data: dataExport,
            message: "Success"
        });
    } catch (err) {
        console.log(err.message);
        res.json({
            status: false,
            message: err.message,
        });
    }
});


export default router;
