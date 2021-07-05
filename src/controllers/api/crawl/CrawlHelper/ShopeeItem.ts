// @ts-nocheck
/* eslint-disable @typescript-eslint/camelcase */
// eslint-disable-next-line no-use-before-define

import { Sequelize, Op } from "sequelize";
import axios from "axios";
import helper from "../Helper";
import { DiscountCrawlModel, checkExisted } from "@models/DiscountCrawl";

const itemShopee = async (url: any) => {

    const product = new Object();

    if (url.search("product") > -1) {
        const pasre = url.split("/");
        product["shop_id"] = Number(pasre[4]);
        product["item_id"] = Number(pasre[5]);

    } else if (url.search("-i.") > -1) {
        const pasre = url.split("-i.");
        const pasre2 = pasre[1].split(".");
        product["shop_id"] = Number(pasre2[0]);
        product["item_id"] = Number(pasre2[1]);
    }

    if(!product["shop_id"] && !product["item_id"])  return { status: false, error: "Invalid URL!" };



    try {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    "referer": url,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
            };
            axios.get("https://shopee.vn/api/v2/item/get?itemid=" + product["item_id"] + "&shopid=" + product["shop_id"], options).then(shoppeGetItem => {
                product["model_id"] = shoppeGetItem.data.item.models[0].modelid;
                resolve(product);
            })
            .catch(error => {
                reject(error);
            });
        });
    } catch (e) {
        return {
            status: false,
            msg: e.message
        };
    }
};

const getCouponData = async () => {

    const currentTime = helper.timeStamp();
    console.log(currentTime);
    const data = await DiscountCrawlModel.findAll({
        where: {
            expiredAt:{
                [Op.gt]: currentTime
            }
         }
    });

    return data;
};



export default {
    itemShopee: itemShopee,
    getCouponData: getCouponData
};