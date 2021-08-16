/* eslint-disable @typescript-eslint/camelcase */

import express, { Response, Request, Router } from "express";
import dotenv from "dotenv";
import { BannerInterface, Banner } from "@models/Banner";
import { getSettings, SettingsInterface, SettingsModel } from "@models/LotterySettings";


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

        dataExport.exchange = {};
        dataExport.exchange.local_min = await getSettings("exchange_local_min");
        dataExport.exchange.local_max = await getSettings("exchange_local_max");
        dataExport.exchange.momo_min = await getSettings("exchange_momo_min");
        dataExport.exchange.momo_max = await getSettings("exchange_momo_max");
        dataExport.exchange.vnpay_min = await getSettings("exchange_vnpay_min");
        dataExport.exchange.vnpay_max = await getSettings("recharge_vnpay_max");
        dataExport.exchange.bank_min = await getSettings("exchange_bank_min");
        dataExport.exchange.bank_max = await getSettings("exchange_bank_max");

        dataExport.recharge = {};
        dataExport.recharge.momo_min = await getSettings("recharge_momo_min");
        dataExport.recharge.momo_max = await getSettings("recharge_momo_max");
        dataExport.recharge.vnpay_min = await getSettings("recharge_vnpay_min");
        dataExport.recharge.vnpay_max = await getSettings("recharge_vnpay_max");
        
        dataExport.ticket = {};
        dataExport.ticket.ticket_storage_fee = await getSettings("ticket_storage_fee");

        dataExport.support = {};
        dataExport.support.phone = await getSettings("hot_line");


        res.json({
            status: true,
            data: dataExport,
            message: "Success"
        });
    }catch (err) {
        console.log(err.message);
        res.json({
            status: false,
            message: err.message,
        });
    }
});


export default router;
