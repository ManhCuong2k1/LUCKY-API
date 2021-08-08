/* eslint-disable @typescript-eslint/camelcase */

import express, { Response, Request, Router } from "express";
import dotenv from "dotenv";
import { BannerInterface, Banner } from "@models/Banner";


dotenv.config();
const router = Router();


router.get("/app-settings", async (req: Request, res: Response) => {
    try {

        interface ExportInterface {
            [key: string]: any;
        }
        const dataExport: ExportInterface = {};
        

        dataExport.host = process.env.HOST;
        dataExport.port = process.env.PORT;
        dataExport.images = {};
        dataExport.images.service_upload = process.env.HOST_IMAGES_URL;
        dataExport.images.service_export = process.env.HOST_IMAGES_EXPORT_URL;
        dataExport.banner = await Banner.findAll();


        
        dataExport.recharge = {};
        dataExport.exchange = {};
        dataExport.exchange.local_min = 100000;
        dataExport.exchange.wallet_min = 100000;
        dataExport.exchange.bank_min = 100000;
        dataExport.recharge.momo_min = 10000;
        dataExport.recharge.vnpay_min = 10000;



        

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