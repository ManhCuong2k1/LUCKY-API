import helper from "../Helper";
import request from "request";

const getAllPromotions = async () => {
    try {
        return new Promise((resolve, reject) => {

            const options = {
                "method": "GET",
                "url": "https://publisher-api.masoffer.net/v1/promotions?publisher_id=channel1&token=gBLQaAQlIakCLIeYi2leOA%3D%3D&offer_id=shopee&type=all&limit=5000",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            };
        
            const arrayPromotions: any = [];

            request(options, function (error, response) {
                if(response.body) {

                    const dataJsonPromotions = JSON.parse(response.body);
                    const dataPromotions = dataJsonPromotions.data;

                    dataPromotions.forEach((data: any) => {
                        arrayPromotions.push(data);
                    });
                    resolve(arrayPromotions);
                }else {
                    reject(error);
                }
            });
        });
    }catch (e) {
        return {
            status: false,
            msg: e.message
          };
    }
};


export default {
    getAllPromotions: getAllPromotions
};