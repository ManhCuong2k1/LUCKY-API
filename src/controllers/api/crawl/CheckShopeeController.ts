/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
import { DiscountCrawlModel } from "@models/DiscountCrawl";
import express, { Response, Request } from "express";
import * as fs from "fs";
import * as path from "path";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const voucher = req.body.voucher;
        const productInfo = req.body.product_info;
        // const voucherDB = await DiscountCrawlModel.findOne({
        //     where: {
        //         couponCode: voucher.voucher_code
        //     }
        // });
        const voucherDB = await DiscountCrawlModel.findByPk(10);

        const axios = require("axios");
        const data = JSON.stringify({
            "voucher_code": voucher.voucher_code,
            "shoporders": [
                {
                    "shopid": productInfo.shop_id,
                    "extrainfo": {},
                    "iteminfos": [
                        {
                            "itemid": productInfo.item_id,
                            "is_add_on_sub_item": false,
                            "image": "dd200b363e9c48af6697e7abd9d5138c",
                            "shopid": productInfo.shop_id,
                            "opc_extra_data": {
                                "slash_price_activity_id": 0
                            },
                            "promotion_id": voucher.voucher_promotion_id,
                            "add_on_deal_id": 0,
                            "modelid": productInfo.model_id,
                            "offerid": 0,
                            "source": "",
                            "checkout": true,
                            "item_group_id": 0,
                            "service_by_shopee_flag": false,
                            "is_streaming_price": false,
                            "none_shippable_full_reason": "",
                            "price": 20500000000,
                            "is_flash_sale": false,
                            // "categories": [
                            //     {
                            //         "catids": [
                            //             84,
                            //             2817,
                            //             11371
                            //         ]
                            //     }
                            // ],
                            "shippable": true,
                            // "name": "Sạc Dự Phòng Romoss Sense 4 10000mah Chính Hãng Check Code - BH 1 năm",
                            "none_shippable_reason": "",
                            "is_pre_order": false,
                            "stock": 0,
                            "model_name": "",
                            "quantity": 1
                        }
                    ],
                    "shop_vouchers": [],
                    // "selected_carrier_id": 50012
                }
            ],
            "selected_payment_channel_data": {
                "channel_id": 5000102,
                "channel_item_option_info": {
                    "credit_card_data": {
                        "bank_name": "VIETNAM TECHNOLOGICAL AND COMMERCIAL JSB",
                        "expiry_date": "10-2024",
                        "bank_id": 4847,
                        "card_number": "422149xxxxxx3320"
                    },
                    "channel_item_id": 6067235
                },
                "version": 2,
                "text_info": {}
            }
        });

        const config = {
            method: "post",
            url: "https://shopee.vn/api/v2/voucher_wallet/validate_platform_voucher_by_voucher_code",
            headers: {
                "authority": "shopee.vn",
                "pragma": "no-cache",
                "cache-control": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                "x-api-source": "pc",
                "accept": "application/json",
                "x-shopee-language": "vi",
                "x-requested-with": "XMLHttpRequest",
                "if-none-match-": "55b03-acab33010d05cfc0472674f310f64d4b",
                "content-type": "application/json",
                "x-csrftoken": "XywMNCdRzpLdLqGJDNkwcrwjZ61jfMns",
                "origin": "https://shopee.vn",
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
                "referer": "https://shopee.vn/checkout/?state=H8KLCAAAAAAAAAPDjVVLb8ObMAzDvivChcOOGcOgw5jDjsKjwr51XcKxdcOoA8OYwoZdwopAwpAtJhVqS8KeJBcJworDvMO3wpHClsOlwrgFCsO0MmDCvkQiKcOyw6PDh0dewphXDTgvwprClhXDs2XCmsOmw4t1wpbDpDPDph5Na8KsBMOrWMOxw7DDkl9ZEX7ClWTDhXrCscOMwpbDmcOqOGPDikMTbMOoRMK6NF3DjMOXw6vDswV6acKMwoTCusK3T8KSw6U6XcKkw7kqwpsxISU3wppLEDUnZcKCXhwfwqTCris5eWLDhVbDlA5CAMK%2BwrPCpmvCo8Oxwp9OaMKvw7wBER83M1bCm8Kdcl5Vwo4AWsKoTMOTwoDCliB5w7UowrTCpsO4wqjDkV1dI8OawrI7woDCpVAWwpzDo1J4QcKPwrzDmEcZKxjDqxHDtgbDvsOQQh9yEBDCgCzDgcOcw47Dl8Oow4xBDcKVw4dAEcOBKSIrFkkyT8KJR8OVwrZKw696w6zDs8OJwpvDlsOCFsKsw4UTUcO0DMO2w4DCqRTDnMK0XiENHzV3wrXDscKBF8Kiw6JkLg5IwoLCj8KAw4ZMw6N9QMKYw4wTw4Q4CsKJw6kYX29Nw78AQyrDtCPCrBzCncKUQj9xLRrCpMKGw73CvsK%2Bw7p1d3F7w7bDq8Oqw7LDm8Odw73DjcO9w5fDq8OLwovCm8KzwovCuy9nwpfDt8K3wrdXPy7Cr8Oxw7rDvcOnZyQVw7bCrULDmMOowoUew47Ck09pwpLDpijDr8OdEcKgfMKdwq8QDcKFw5JdU8KCRcKzPE3Dp8O5w7nCvsO%2FwrIsTcOYw7ENXnrCuEzClsKrNFvCoArCiXEIH8KbcMOGPMOsfcOMw6PCiMK6w5bCmsOGw7TDicOFRDoHwrwySsK7wrHDmcK2FsKQw5NYwrNnw5NVwo%2FDmC%2FCkcKMd8K0wqErwqVywqLCrMKRewvDghEEasK5w7c8VjgYw5RqBMKrFn5rbBN1NEzCmzDCgG9EeMKswp7DuFTDgcKxw4ZWw6gKThnCiMOOGy7DmsK2PsK8wrIcw7QYT8OCwrPCqmDDjCleZcOow7zDocK6RcKwYFvCq8K0D3Jvw7ROdsKawpfCtcKowp5KwrMPw5IwTsKxw5kmXGMRw71pesKqWsO1w7pAFE1bwozDnsKfw6XDgMOEw4jDknTDsRx0w4UKbzvDuMOgwqA%2FbMO%2Bwosxwo%2FDqxMzwpXCsMKnw7o8JMKbCAxdwowNw47DvsO1TggwwrrClsOmbizDkcOQTMKmw7PDqMKFCh45GhPDgT3DrMKNFzUywrHCok1Bw58kT8Osw7bDinRYw5TCk8OdVB3CpcK8BMOsbRjDjV97Kzsta8Oow78Iw5zDhCQMTljDuUjDmETCg28awrBEP8OKYBI7TcKiw5fCocOBwrAnaRrDuyfCgXTCv8OXfAtDQ07CtsOawrgWYsOgXkADw5rCj8KRAhkVVFQYNgZOwrkEaE7DisKQw64YNsONw5PDhStAw5gETRvDgiTDh8OjX8OrwoLCj8OleAcAAA%3D%3D",
                "accept-language": "en-US,en;q=0.9,vi;q=0.8",
                "cookie": "_gcl_au=1.1.1016984553.1622008246; _fbp=fb.1.1622008246485.1048608005; csrftoken=XywMNCdRzpLdLqGJDNkwcrwjZ61jfMns; REC_T_ID=513b60f1-bde6-11eb-b9ba-3c15fb3af01b; SPC_F=6frNmPDA4tGLPYlqicWNUSmA4FMgRDZk; welcomePkgShown=true; _hjid=54624e9b-2b53-4425-8d80-bbb941e354eb; G_ENABLED_IDPS=google; G_AUTHUSER_H=0; SPC_CLIENTID=NmZyTm1QREE0dEdMmbybljfubhzqcfcp; SPC_U=33515830; SPC_EC=08brF3wNe6vtfrEs5Bn1/nnlPbwOVva1DxarrpZGnNxTPoIIDMWymlmF7ZDXu1H5bFI2T51DLs93rGSr2aLdbHVlZnnQGnQUscEon3LvLtpDTxcMsK+B6lFhDT5IoG7BHgiBJlCaFTIVnxv+fxg2fw==; SPC_IA=1; SPC_SI=mall.tu22dB0n4PLGGMyLU7MNrkF81fxECYuY; _gid=GA1.2.1271454347.1622384094; AMP_TOKEN=%24NOT_FOUND; _hjAbsoluteSessionInProgress=0; _med=refer; _ga=GA1.2.1524283769.1622008249; _dc_gtm_UA-61914164-6=1; _ga_M32T05RVZT=GS1.1.1622467591.6.1.1622468305.45; SPC_R_T_ID=\"UC9N8OxpkUMwMKECsHcdBt4vBgDi1/DkKclyHre1SKCHvXU2VEQt6/92N5Goa24GWeLNqpZvF2+wPb/fIh5xps9o/c46x3aWbjIqaWLaoI4=\"; SPC_T_IV=\"Le+pZzbH4ej6oQrBzuNurQ==\"; SPC_R_T_IV=\"Le+pZzbH4ej6oQrBzuNurQ==\"; SPC_T_ID=\"UC9N8OxpkUMwMKECsHcdBt4vBgDi1/DkKclyHre1SKCHvXU2VEQt6/92N5Goa24GWeLNqpZvF2+wPb/fIh5xps9o/c46x3aWbjIqaWLaoI4=\"; SPC_R_T_ID=\"XMP2i8PTPpwVy6t3e6W7YQUm5IhMDkU92uOHCNYVkTEQHt4TR65Dk8FcGYTFQzKzx0vYNxC4a1LEaIizWAOAAGmYCvSN/AwqDd5L/slpprI=\"; SPC_R_T_IV=\"0AsN+5HM0VR5aronOYRhRA==\"; SPC_SI=mall.tu22dB0n4PLGGMyLU7MNrkF81fxECYuY; SPC_T_ID=\"XMP2i8PTPpwVy6t3e6W7YQUm5IhMDkU92uOHCNYVkTEQHt4TR65Dk8FcGYTFQzKzx0vYNxC4a1LEaIizWAOAAGmYCvSN/AwqDd5L/slpprI=\"; SPC_T_IV=\"0AsN+5HM0VR5aronOYRhRA==\""
            },
            data: data
        };

        axios(config)
            .then(function (response: any) {
                const resAxios = response.data;
                const data = {
                    voucher_code: voucher.voucher_code,
                    voucher_description: voucherDB.longDescription,
                    voucher_detail_link: `https://rutgon.me/v0/MGUYSvZ9xgl_dGJ8LUf8WA?url=https%3A%2F%2Fshopee.vn%2Fproduct%2F${productInfo.shop_id}%2F${productInfo.item_id}&mo_source=shopee_voucher`,
                    voucher_end_time: voucherDB.expiredAt * 1000,
                    voucher_icon: "https://cf.shopee.vn/file/092a04b831e2e5e505bdaa94f7221aee",
                    voucher_icon_hash: "092a04b831e2e5e505bdaa94f7221aee",
                    voucher_icon_text: "AirPay",
                    voucher_link: `https://rutgon.me/v0/MGUYSvZ9xgl_dGJ8LUf8WA?url=https%3A%2F%2Fshopee.vn%2Fproduct%2F${productInfo.shop_id}%2F${productInfo.item_id}&mo_source=shopee_voucher`,
                    voucher_min_spend: 0,
                    voucher_discount: 10,
                    voucher_percentage_used: 9,
                    voucher_reward_cap: 2000000000,
                    voucher_start_time: voucherDB.startAt * 1000,
                    voucher_type: "Giảm giá",
                };
                if (resAxios.data.voucher.promotionid != null ){
                    res.send({ data });
                } else {
                    res.send({ data: [] });
                }
            })
            .catch(function (error: any) {
            });
    } catch (e) {
        res.send({ data: [] });
    }
});

router.get("/script.js", async (req: Request, res: Response) => {
    try {
        const filePath = path.join(__dirname, "../../../statics/validate-shopee-voucher.js");

        fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
            if (!err) {
                res.type(".js");
                res.send(data);
            } else {
                console.log(err);
            }
        });
    } catch (e) {
        res.status(401).send({
            code: e.message
        });
    }
});


export default router;
