// @ts-nocheck
/* eslint-disable @typescript-eslint/camelcase */

import helper from "../Helper";
import request from "request";

const getrecommendvouchers = (signature: any, voucherlabelid: any, limit: number) => {
    const csrftoken = helper.randomString(32);
    
    const databody: any = {
      "voucher_label_id": voucherlabelid,
      "signature": signature,
      "signature_source": "3",
      "offset": 0,
      "limit": limit,
      "rcmd_bundle_id": 0
    };

    const options = {
      "method": "POST",
      "url": "https://shopee.vn/api/v2/voucher_wallet/get_recommend_vouchers_by_voucher_label_id",
      "headers": {
        "x-csrftoken": ""+csrftoken+"",
        "referer": "https://shopee.vn/m/ma-giam-gia",
        "cookie": "_gcl_au=1.1.881303.1620795691; SPC_IA=-1; SPC_EC=-; SPC_F=V1aCH0HGgmF6kEy2oVe7bNgoDBDKmhYP; REC_T_ID=1deb806a-b2df-11eb-96bf-48df37dc9650; SPC_SI=mall.HvNgQaiUwQi7vpCIn7du6zRGQaqYLUh3; SPC_U=-; _hjid=0593f481-efcf-4e0c-887f-129a49bd75eb; csrftoken="+csrftoken+"; _gid=GA1.2.503443506.1620795692; HAS_BEEN_REDIRECTED=true; _hjAbsoluteSessionInProgress=1; AMP_TOKEN=%24NOT_FOUND; _ga_M32T05RVZT=GS1.1.1620814098.18.1.1620814398.57; _ga=GA1.2.574788689.1620795692; SPC_CLIENTID=VjFhQ0gwSEdnbUY2dqqsnwznzcilmfdc; SPC_R_T_ID=\"/00egaBl6ugHqwiY641Ez7A5mzNwe8mcENRwJfaXe8MwxdkUePpYD2MGlw/3S3yEOev8lmCNm04AmHgt+WlWYBiQm1+Ja2F2L88Aug8yNzg=\"; SPC_T_IV=\"9Wyl7cdc+hWroe0ads7yKA==\"; SPC_R_T_IV=\"9Wyl7cdc+hWroe0ads7yKA==\"; SPC_T_ID=\"/00egaBl6ugHqwiY641Ez7A5mzNwe8mcENRwJfaXe8MwxdkUePpYD2MGlw/3S3yEOev8lmCNm04AmHgt+WlWYBiQm1+Ja2F2L88Aug8yNzg=9; SPC_IA=-1; SPC_EC=-; SPC_F=pgc7HXyS24FFqSSsvVb88FIcTmXeR609; REC_T_ID=a59d7984-b170-11eb-8973-1409dccf20f1; SPC_SI=mall.Pdo5lhAk1zeQcwLE2wfhC1QFJ1zHYcGD; SPC_U=-; SPC_R_T_ID=\"Gz8rrZf9p+a7Fj8SWGhR4NbMkyhd6EK0lGSsof/aRdoAYhOAqd28E6RwZKXN4Y3d64lDj0aIC55tvs+7qvG3hIHYXTMBJzMPFbdsMrrj+Bs=\"; SPC_T_IV=\"zyhg1adcKJum3E/Hpo/pCw==\"; SPC_R_T_IV=\"zyhg1adcKJum3E/Hpo/pCw==\"; SPC_T_ID=\"Gz8rrZf9p+a7Fj8SWGhR4NbMkyhd6EK0lGSsof/aRdoAYhOAqd28E6RwZKXN4Y3d64lDj0aIC55tvs+7qvG3hIHYXTMBJzMPFbdsMrrj+Bs=\"",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(databody)
    };

    const arrayquerybatch = {};
    arrayquerybatch["promotion_info"] = [];

    try {
        return new Promise((resolve, reject) => {

            request(options, function (error: any, response: any) {
                if(error) {
                    reject(err);
                }else {
                    const getrecommendvouchersbyvoucherlabelid = JSON.parse(response.body);
                    //resolve(getrecommendvouchersbyvoucherlabelid.data.promotion_info);

                    getrecommendvouchersbyvoucherlabelid.data.promotion_info.forEach(async (promotion: any) => {
                        //console.log('Promotion '+count_vouchers+' : '+ promotion.promotionid);
             
                        arrayquerybatch["promotion_info"].push({
                            promotionid: promotion.promotionid,
                            signature: promotion.signature,
                            signature_source: "0"
                        });
                     });



                     request({
                        "method": "POST",
                        "url": "https://shopee.vn/api/v2/voucher_wallet/batch_get_vouchers_by_promotion_ids",
                        "headers": {
                          "x-csrftoken": ""+csrftoken+"",
                          "referer": "https://shopee.vn/m/ma-giam-gia",
                          "cookie": "_gcl_au=1.1.881303.1620795691; SPC_IA=-1; SPC_EC=-; SPC_F=V1aCH0HGgmF6kEy2oVe7bNgoDBDKmhYP; REC_T_ID=1deb806a-b2df-11eb-96bf-48df37dc9650; SPC_SI=mall.HvNgQaiUwQi7vpCIn7du6zRGQaqYLUh3; SPC_U=-; _hjid=0593f481-efcf-4e0c-887f-129a49bd75eb; csrftoken="+csrftoken+"; _gid=GA1.2.503443506.1620795692; HAS_BEEN_REDIRECTED=true; _hjAbsoluteSessionInProgress=1; AMP_TOKEN=%24NOT_FOUND; _ga_M32T05RVZT=GS1.1.1620814098.18.1.1620814398.57; _ga=GA1.2.574788689.1620795692; SPC_CLIENTID=VjFhQ0gwSEdnbUY2dqqsnwznzcilmfdc; SPC_R_T_ID=\"/00egaBl6ugHqwiY641Ez7A5mzNwe8mcENRwJfaXe8MwxdkUePpYD2MGlw/3S3yEOev8lmCNm04AmHgt+WlWYBiQm1+Ja2F2L88Aug8yNzg=\"; SPC_T_IV=\"9Wyl7cdc+hWroe0ads7yKA==\"; SPC_R_T_IV=\"9Wyl7cdc+hWroe0ads7yKA==\"; SPC_T_ID=\"/00egaBl6ugHqwiY641Ez7A5mzNwe8mcENRwJfaXe8MwxdkUePpYD2MGlw/3S3yEOev8lmCNm04AmHgt+WlWYBiQm1+Ja2F2L88Aug8yNzg=9; SPC_IA=-1; SPC_EC=-; SPC_F=pgc7HXyS24FFqSSsvVb88FIcTmXeR609; REC_T_ID=a59d7984-b170-11eb-8973-1409dccf20f1; SPC_SI=mall.Pdo5lhAk1zeQcwLE2wfhC1QFJ1zHYcGD; SPC_U=-; SPC_R_T_ID=\"Gz8rrZf9p+a7Fj8SWGhR4NbMkyhd6EK0lGSsof/aRdoAYhOAqd28E6RwZKXN4Y3d64lDj0aIC55tvs+7qvG3hIHYXTMBJzMPFbdsMrrj+Bs=\"; SPC_T_IV=\"zyhg1adcKJum3E/Hpo/pCw==\"; SPC_R_T_IV=\"zyhg1adcKJum3E/Hpo/pCw==\"; SPC_T_ID=\"Gz8rrZf9p+a7Fj8SWGhR4NbMkyhd6EK0lGSsof/aRdoAYhOAqd28E6RwZKXN4Y3d64lDj0aIC55tvs+7qvG3hIHYXTMBJzMPFbdsMrrj+Bs=\"",
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify(arrayquerybatch)
                      }, function (error: any, response: any) {

                        if(helper.isJson(response.body)) {
                          const dataVoucherPromotion = JSON.parse(response.body);
                          resolve(dataVoucherPromotion.data.id_voucher_mappings);

                        }else {
                          resolve(false);
                        }
                    });

                }          
            });

        });
    }catch(err) {
        console.log(err);
        return err;
    }
};


const getvoucherfreeship = () => {
    try {
        const arrayPromotion = []; // mảng chứa cac voucher

        return new Promise((resolve, reject) => {
            helper.crawlPage("https://shopee.vn/api/v2/microsite/campaign_site_page?url=ma-giam-gia&platform=mobile&_mod=microsite", null)
            .then(async (data: any) => {
                if(!data) {
                    reject(data);
                }else {
                    
                }
              const datashoppe = JSON.parse(data);
              const dataloopvoucher = datashoppe.data.data.content.children;
              
              dataloopvoucher.forEach(async (coupon: any) => {
        
                coupon.children.forEach(async (voucher: any) => {
    
                  if(voucher.type == 21 || voucher.type == 10) { // mã 
        
                    if(voucher.type == 21) {
                      arrayPromotion.push(voucher.data);
                    }
        
                    // if(voucher.type == 10) { 
                    //     arrayPromotion.push(voucher.data);
                    // }
        
                  }
                });
        
              });

              resolve(arrayPromotion);
            
            });
        });

    }catch(err) {
        console.log(err);
        return err;
    }
};








export default {
    getrecommendvouchers: getrecommendvouchers,
    getvoucherfreeship: getvoucherfreeship
};