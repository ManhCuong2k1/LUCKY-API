import helper from "./Helper";
import masoffer from "./CrawlHelper/masoffer";
import { DiscountCrawlModel, checkExisted } from "@models/DiscountCrawl";

const shopee = async () => { 
    try {
        const dataShopee: any = await masoffer.getAllPromotions();
        
        const offer = "shopee";
        
        let i = 0;

        dataShopee.forEach(async (data: any) => {

            if(data.type == "coupon") {
                
                const isHave = await checkExisted(offer, data.coupon_code);
                
                if(!isHave) {

                    
                    if (typeof data.extra != "undefined") {
                        DiscountCrawlModel.create({
                            offer: offer,
                            category: data.category_name,
                            categorySlug: data.slug,
                            title: encodeURI(data.title),
                            status: data.status,
                            discountAmount: data.discount,
                            startAt: Number(data.started_time) / 1000,
                            expiredAt: Number(data.expired_time) / 1000,
                            couponType: data.type,
                            couponCode: data.coupon_code,
                            longDescription: data.content,
                            couponId: data.extra.shopee_promotion_id,
                            moreInfo: JSON.stringify({
                                disabled: false,
                                icontext: null,
                                status: data.status,
                                maxvalue: null,
                                minspend: null,
                                productlimit: null,
                                shopid: null,
                                shoplogo: null,
                                shopname: null,
                                signature: data.extra.shopee_signature,
                                usagelimitperuser: null,
                            }),
                            externalLinks: data.external_links[0]
                        });                      
                    }

                    console.log("mang " + i);

                }

            }
            i++;
        });

    }catch(e) {
        return {
            status: false,
            msg: e.message
          };
    }

};


export default {
    shopee: shopee
};