import helper from "./Helper";
import request from "request-promise";
import axios from "axios";
import shopeeHelper from "./CrawlHelper/shopee";
import lazadaHelper from "./CrawlHelper/lazada";

import LazadaModel from "@models/LazadaVoucher";
import { DiscountCrawlModel, checkExisted } from "@models/DiscountCrawl";
import { LotteryModel, LotteryCheck } from "@models/Lottery";


const TikiCrawl = async () => {
  try {
    // Lấy Nhóm Coupon Chính
    helper.crawlPage("https://tiki.vn/khuyen-mai/ma-giam-gia", null)
      .then(async (data: any) => {
        const datajsontiki = helper.cutstring(data, "__NEXT_DATA__ = ", ";__NEXT_LOADED_PAGES__");
        const datatiki = JSON.parse(datajsontiki);
        const pagesdata = datatiki.props.initialProps.pageProps.pageData.pages[0];

        // Lấý Fast Voucher
        const fastcouponid = pagesdata.widgets[7].id;
        const fastpayloaddata = JSON.parse(pagesdata.widgets[7].payload);
        const fastobjcoupon = fastpayloaddata.codes;
        const fastcouponcategory = "fast_coupon";

        let faststringcoupon = "";
        for (const code in fastobjcoupon) {
          faststringcoupon = faststringcoupon + "," + fastobjcoupon[code];
        }

        helper.crawlPage("https://tiki.vn/api/v2/events/coupon/v2?codes=" + faststringcoupon.substring(1) + "&id=" + fastcouponid, null)
          .then(async (data: any) => {
            const datavoucher = JSON.parse(data);


            if (Object.keys(datavoucher).length > 0) {

              datavoucher.data.forEach(async (coupon: any) => {
                const existed = await checkExisted("tiki", coupon.coupon_code);
                if (!existed) {
                  DiscountCrawlModel.create({
                    offer: "tiki",
                    categorySlug: fastcouponcategory,
                    title: coupon.label,
                    subTitle: coupon.icon_name,
                    discountAmount: coupon.discount_amount,
                    longDescription: coupon.long_description,
                    shortDescription: coupon.short_description,
                    couponType: coupon.coupon_type,
                    couponCode: coupon.coupon_code,
                    expiredAt: coupon.expired_at,
                    couponId: coupon.coupon_id,
                    moreInfo: JSON.stringify({
                      iconurl: coupon.icon_url,
                      shorttitle: coupon.short_title,
                      status: coupon.status,
                      period: coupon.period,
                    }),
                  });
                }
              });
            }

          });




        // Lấy Voucher Dành Cho Hội Viên
        const membercouponid = pagesdata.widgets[13].id;
        const memberpayloaddata = JSON.parse(pagesdata.widgets[13].payload);
        const memberobjcoupon = memberpayloaddata.codes;
        const membercouponcategory = "member_coupon";

        let memberstringcoupon = "";
        for (const code in memberobjcoupon) {
          memberstringcoupon = memberstringcoupon + "," + memberobjcoupon[code];
        }

        helper.crawlPage("https://tiki.vn/api/v2/events/coupon/v2?codes=" + memberstringcoupon.substring(1) + "&id=" + membercouponid, null)
          .then(async (data: any) => {
            const datavoucher = JSON.parse(data);


            if (Object.keys(datavoucher).length > 0) {

              datavoucher.data.forEach(async (coupon: any) => {
                const existed = await checkExisted("tiki", coupon.coupon_code);
                if (!existed) {
                  DiscountCrawlModel.create({
                    offer: "tiki",
                    categorySlug: membercouponcategory,
                    title: coupon.label,
                    subTitle: coupon.icon_name,
                    discountAmount: coupon.discount_amount,
                    longDescription: coupon.long_description,
                    shortDescription: coupon.short_description,
                    couponType: coupon.coupon_type,
                    couponCode: coupon.coupon_code,
                    expiredAt: coupon.expired_at,
                    couponId: coupon.coupon_id,
                    moreInfo: JSON.stringify({
                      iconurl: coupon.icon_url,
                      shorttitle: coupon.short_title,
                      status: coupon.status,
                      period: coupon.period,
                    }),
                  });
                }
              });
            }

          });




        // Lấy Voucher ZALOPAY
        const zalocouponid = pagesdata.widgets[16].id;
        const zalopayloaddata = JSON.parse(pagesdata.widgets[16].payload);
        const zaloobjcoupon = zalopayloaddata.codes;
        const zalocouponcategory = "zalo_coupon";

        let zalostringcoupon = "";
        for (const code in zaloobjcoupon) {
          zalostringcoupon = zalostringcoupon + "," + zaloobjcoupon[code];
        }

        helper.crawlPage("https://tiki.vn/api/v2/events/coupon/v2?codes=" + zalostringcoupon.substring(1) + "&id=" + zalocouponid, null)
          .then(async (data: any) => {
            const datavoucher = JSON.parse(data);


            if (Object.keys(datavoucher).length > 0) {

              datavoucher.data.forEach(async (coupon: any) => {
                const existed = await checkExisted("tiki", coupon.coupon_code);
                if (!existed) {
                  DiscountCrawlModel.create({
                    offer: "tiki",
                    categorySlug: zalocouponcategory,
                    title: coupon.label,
                    subTitle: coupon.icon_name,
                    discountAmount: coupon.discount_amount,
                    longDescription: coupon.long_description,
                    shortDescription: coupon.short_description,
                    couponType: coupon.coupon_type,
                    couponCode: coupon.coupon_code,
                    expiredAt: coupon.expired_at,
                    couponId: coupon.coupon_id,
                    moreInfo: JSON.stringify({
                      iconurl: coupon.icon_url,
                      shorttitle: coupon.short_title,
                      status: coupon.status,
                      period: coupon.period,
                    }),
                  });
                }
              });
            }

          });

      });



    // Lấý Voucher Miễn Phí Vận Chuyển
    helper.crawlPage("https://api.tiki.vn/tequila/v1/consumer/coupon-hub/platform_shipping_coupons", null)
      .then(async (data: any) => {
        const datajsontikifreeship = JSON.parse(data);
        const freeshipcouponcategory = "freeship_coupon";
        if (datajsontikifreeship.message == "OK") {

          const listcoupon = datajsontikifreeship.coupons;

          listcoupon.forEach(async (coupon: any) => {
            const existed = await checkExisted("tiki", coupon.coupon_code);
            if (!existed) {
              DiscountCrawlModel.create({
                offer: "tiki",
                categorySlug: freeshipcouponcategory,
                title: coupon.label,
                subTitle: coupon.icon_name,
                discountAmount: coupon.discount_amount,
                longDescription: coupon.long_description,
                shortDescription: coupon.short_description,
                couponType: coupon.coupon_type,
                couponCode: coupon.coupon_code,
                expiredAt: coupon.expired_at,
                couponId: coupon.coupon_id,
                moreInfo: JSON.stringify({
                  iconurl: coupon.icon_url,
                  shorttitle: coupon.short_title,
                  status: coupon.status,
                  period: coupon.period,
                }),
              });
            }
          });
        }
      });



    // Lấý Voucher Siêu Hot Từ Cửa Hàng
    helper.crawlPage("https://api.tiki.vn/tequila/v1/consumer/coupon-hub/top", null)
      .then(async (data: any) => {
        const datajsontikifromstore = JSON.parse(data);
        const fromstorecouponcategory = "freeship_coupon";
        if (datajsontikifromstore.message == "OK") {

          const listcoupon = datajsontikifromstore.coupons;

          listcoupon.forEach(async (coupon: any) => {
            const existed = await checkExisted("tiki", coupon.coupon_code);
            if (!existed) {
              DiscountCrawlModel.create({
                offer: "tiki",
                categorySlug: fromstorecouponcategory,
                title: coupon.label,
                subTitle: coupon.icon_name,
                discountAmount: coupon.discount_amount,
                longDescription: coupon.long_description,
                shortDescription: coupon.short_description,
                couponType: coupon.coupon_type,
                couponCode: coupon.coupon_code,
                expiredAt: coupon.expired_at,
                couponId: coupon.coupon_id,
                moreInfo: JSON.stringify({
                  iconurl: coupon.icon_url,
                  shorttitle: coupon.short_title,
                  status: coupon.status,
                  period: coupon.period,
                }),
              });
            }
          });

        }

      });



    // Config Các ID chuyên mục

    const arraycategory = [
      {
        id: "8322",
        name: "Nha Sach",
        string: "bookstore",
      },
      {
        id: "4384",
        name: "Bach Hoa",
        string: "grocery",
      },
      {
        id: "44792",
        name: "Thuc Pham - Tuoi Song",
        string: "food",
      },
      {
        id: "1520",
        name: "Lam Dep - va Khoe",
        string: "beauty_health",
      },
      {
        id: "2549",
        name: "Do Choi - Me va Be",
        string: "toy_mother_and_baby",
      },
      {
        id: "1883",
        name: "Nha Cua - Doi Song",
        string: "house_life",
      },
      {
        id: "1882",
        name: "Dien Gia Dung",
        string: "electric_appliances",
      },
      {
        id: "4221",
        name: "Dien Tu - Dien Lanh",
        string: "electronics",
      },
      {
        id: "1789",
        name: "Dien Thoai - May Tinh Bang",
        string: "phone_tablet",
      },
      {
        id: "1815",
        name: "Thiet Bi Ki Thaut So",
        string: "digital_equipment",
      },
      {
        id: "1846",
        name: "Lap Top - May Tinh Ban",
        string: "laptop_computer",
      },
      {
        id: "1801",
        name: "May Anh - May Quay Phim",
        string: "camera",
      },
      {
        id: "8594",
        name: "Xe - Phu Kien",
        string: "vehicle",
      },
      {
        id: "1975",
        name: "The Thao",
        string: "sports",
      },
      {
        id: "17166",
        name: "Do Ngoai Dia",
        string: "exotic",
      },
      {
        id: "931",
        name: "Thoi Trang Nu",
        string: "fashion_female",
      },
      {
        id: "915",
        name: "Thoi Trang Nam",
        string: "fashion_female",
      },
      {
        id: "1703",
        name: "Giay Dep Nu",
        string: "women_shoe",
      },
      {
        id: "1686",
        name: "Giay Dep Nam",
        string: "men_shoe",
      },
      {
        id: "976",
        name: "Tui Thoi Trang Nu",
        string: "women_bag",
      },
      {
        id: "27616",
        name: "Tui Thoi Trang Nam",
        string: "men_bag",
      },
      {
        id: "6000",
        name: "Balo - Vali",
        string: "balo_vali",
      },
      {
        id: "27498",
        name: "Phu Kien Thoi Trang",
        string: "fashion_accessories",
      },
      {
        id: "8371",
        name: "Dong Ho - Trang Suc",
        string: "watches_jewelry",
      },
    ];


    // Prefix cho Chuyên mục
    const prefix = "hub_coupon_";

    for (const key in arraycategory) {

      helper.crawlPage("https://api.tiki.vn/tequila/v1/consumer/coupon-hub?categories=" + arraycategory[key].id, null)
        .then(async (data: any) => {
          const datajsontikihub = JSON.parse(data);
          const hubcouponcategory = prefix + arraycategory[key].string;
          if (datajsontikihub.message == "OK" && Object.keys(datajsontikihub.coupons).length > 0) {

            const categoryid = arraycategory[key].id;
            const listcoupon = datajsontikihub.coupons[categoryid];

            listcoupon.forEach(async (coupon: any) => {

              const existed = await checkExisted("tiki", coupon.coupon_code);
              if (!existed) {
                DiscountCrawlModel.create({
                  offer: "tiki",
                  categorySlug: hubcouponcategory,
                  title: coupon.label,
                  subTitle: coupon.icon_name,
                  discountAmount: coupon.discount_amount,
                  longDescription: coupon.long_description,
                  shortDescription: coupon.short_description,
                  couponType: coupon.coupon_type,
                  couponCode: coupon.coupon_code,
                  expiredAt: coupon.expired_at,
                  couponId: coupon.coupon_id,
                  moreInfo: JSON.stringify({
                    iconurl: coupon.icon_url,
                    shorttitle: coupon.short_title,
                    status: coupon.status,
                    period: coupon.period,
                  }),
                });
              }
            });

          } else {
            //console.log("Category " + arraycategory[key].name + " nothing!!!!");
          }

        });

    }
  } catch (e) {
    return {
      status: false,
      msg: e.message
    };
  }
};


const ShoppeCrawl = async () => {
  try {

    // shopeeHelper.getvoucherfreeship().then(data => {
    //   console.log(data);
    // });

    // 8311718531cd0ca346561ba9e5b3bfd4eec043d0e4db7118b56ca8d7c655dfe4|3350  HÀNG TIÊU DÙNG
    // 21d1b19c0ab6199b6b03d23c8c4daf2fd6ddff6f86f8a2e9a839b2a371f236d1|3351  THỜI TRANG
    // 31f810864a179df1f892dbb18b9506ef8cde916d80d23da6e1e949349952599d|3352  ĐƠIF SOONGS
    // 9f4d22d668607005f841fd4244c609cbd1089ca16eb7b6ec67d6a628532550f6|3353  ĐIỆN TỬ
    // 541cddaa1242613795b8ca2951b01a5b273c1bdbe52870975d0dd16b383ff85d|3354  HÀNG QUỐC TẾ


    const ArrayCategory: any = [
      {
        id: "8311718531cd0ca346561ba9e5b3bfd4eec043d0e4db7118b56ca8d7c655dfe4",
        voucherlabelid: 3350,
        string: "consumer_goods",
      },
      {
        id: "21d1b19c0ab6199b6b03d23c8c4daf2fd6ddff6f86f8a2e9a839b2a371f236d1",
        voucherlabelid: 3351,
        string: "fashion",
      },
      {
        id: "31f810864a179df1f892dbb18b9506ef8cde916d80d23da6e1e949349952599d",
        voucherlabelid: 3352,
        string: "life",
      },
      {
        id: "9f4d22d668607005f841fd4244c609cbd1089ca16eb7b6ec67d6a628532550f6",
        voucherlabelid: 3353,
        string: "electric",
      },
      {
        id: "541cddaa1242613795b8ca2951b01a5b273c1bdbe52870975d0dd16b383ff85d",
        voucherlabelid: 3354,
        string: "international_goods",
      },
    ];


    // Prefix cho Chuyên mục
    const prefix = "hub_coupon_";

    for (const key in ArrayCategory) {
      shopeeHelper.getrecommendvouchers(ArrayCategory[key].id, ArrayCategory[key].voucherlabelid, 10).then(async (data: any) => {

        //const dataVouchers = JSON.parse(data);
        const hubCouponCategory = prefix + ArrayCategory[key].string;


        for (const key in data) {
          // console.log(data[key].signature);

          const existed = await checkExisted("shopee", data[key].voucher_code);
          if (!existed) {
            DiscountCrawlModel.create({
              offer: "shopee",
              categorySlug: hubCouponCategory,
              discountAmount: data[key].discount_value,
              startAt: data[key].start_time,
              expiredAt: data[key].end_time,
              couponCode: data[key].voucher_code,
              longDescription: data[key].usage_terms,
              couponId: data[key].promotionid,
              moreInfo: JSON.stringify({
                disabled: data[key].disabled,
                icontext: data[key].icon_text,
                status: data[key].status,
                maxvalue: data[key].max_value,
                minspend: data[key].min_spend,
                productlimit: data[key].product_limit,
                shopid: data[key].shop_id,
                shoplogo: data[key].shop_logo,
                shopname: data[key].shop_name,
                signature: data[key].signature,
                usagelimitperuser: data[key].usage_limit_per_user,
              }),
            });
          }

        }

      });
    };
  } catch (e) {
    return {
      status: false,
      msg: e.message
    };
  }
};


const LazadaCrawl = (_callback: any) => {

  try {

    lazadaHelper.getvoucherfreeship().then(async (data: any) => {


      const prefix = "hub_coupon_", hubCouponCategory = prefix + "freeship";



      for (const key in data) {
        const voucherIsHave = await LazadaModel.findCredentials(data[key].voucherSpreadId, hubCouponCategory);
        if (!voucherIsHave) {
          LazadaModel.LazadaVoucherModel.create({
            categorySlug: hubCouponCategory,
            newVoucherType: data[key].newVoucherType,
            originVoucherDiscountValue: data[key].originVoucherDiscountValue,
            originVoucherMinOrderAmount: data[key].originVoucherMinOrderAmount,
            useNowUrl: data[key].useNowUrl,
            voucherCanApply: data[key].voucherCanApply,
            voucherChannel: data[key].voucherChannel,
            voucherCollectEndDate: data[key].voucherCollectEndDate,
            voucherCollectStartDate: data[key].voucherCollectStartDate,
            voucherCurrency: data[key].voucherCurrency,
            voucherDescriptionvi: data[key].voucherDescription_vi,
            voucherDiscountType: data[key].voucherDiscountType,
            voucherDiscountValue: data[key].voucherDiscountValue,
            voucherId: data[key].voucherId,
            voucherMinOrderAmount: data[key].voucherMinOrderAmount,
            voucherMainTitle: data[key].voucherMainTitle,
            voucherResolvedStatus: data[key].voucherResolvedStatus,
            voucherSpreadId: data[key].voucherSpreadId,
            voucherStatus: data[key].voucherStatus,
            voucherTagDesc: data[key].voucherTagDesc,
            voucherTitle: data[key].voucherTitle,
            voucherTotalBudget: data[key].voucherTotalBudget,
            voucherType: data[key].voucherType,
            voucherUrl: data[key].voucherUrl,
            voucherUsageLimitPerCustomer: data[key].voucherUsageLimitPerCustomer,
            voucherUseEndDate: data[key].voucherUseEndDate,
            voucherUseStartDate: data[key].voucherUseStartDate,
            voucherUserCollectTimes: data[key].voucherUserCollectTimes
          });
        }

      }
    });



    _callback();
  } catch (e) {
    return {
      status: false,
      msg: e.message
    };
  }

};


const getShopeeDetail = async (coupon: any) => {
  const voucherDB = await DiscountCrawlModel.findOne({
    where: {
      couponCode: coupon
    }
  });

  if (voucherDB) {

    return new Promise((resolve, reject) => {

      const infoItem = JSON.parse(voucherDB.moreInfo);

      const config: any = {
        method: "post",
        url: "https://shopee.vn/api/v2/voucher_wallet/get_voucher_detail",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          "promotionid": Number(voucherDB.couponId),
          "voucher_code": voucherDB.couponCode,
          "signature": infoItem.signature,
          "need_basic_info": true,
          "need_user_voucher_status": false,
          "source": "0"
        })
      };

      axios(config).then(data => {
        resolve(data.data);
      })
        .catch(error => {
          console.log(error);
          reject(error);
        });

    });

  }
};





const XosoGetNextTime = async (type: string) => {
  try {
	// config header để vào trang kết quả keno
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn",
      "headers": {}
    };
    // lấy nội dung trang kết quả Kano
    const dataResp = await request(options);

    let timeNext;
    let status = true;
    switch (type) {
    	case "power": 
     		timeNext = helper.cutstring(dataResp, "var cd3='", "';");
    	break;
    	case "mega":
        timeNext = helper.cutstring(dataResp, "var cd1='", "';");
    	break;
		  case "max3d":
        timeNext = helper.cutstring(dataResp, "var cd5='", "';");    
		  break;    
      case "max4d":
        timeNext = helper.cutstring(dataResp, "var cd2='", "';");    
      break;
      default:
        status = false;
        timeNext = null;
      break;
    }


    return {
      status: status,
      next: timeNext,
      msg: "Success"
    };

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};


const XosoKenoData = async () => {

  try {

  	// config header để vào trang kết quả keno
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/winning-number-keno",
      "headers": {}
    };

    // lấy nội dung trang kết quả Kano
    const data = await request(options);

    // lấy nội dung bảng kết quả
    const tableResult = helper.cutstring(data, "<table class=\"table table-hover\">", "</table>");
    // lấy nội dung hàng mới nhất trong bảng
    const lastRow = helper.cutstring(tableResult, "<tr style=\"background-color:white\">", "</tr>");

    // lấy list kết quả các số
    let listNumber = helper.cutstring(tableResult, "font-style:consolas;font-color:green\">", "</td>");
    listNumber = helper.replaceString(listNumber, "<div class=\"day_so_ket_qua_v2\">", "");
    listNumber = helper.replaceString(listNumber, "</div>", "");

    let expNumber = helper.replaceString(listNumber, "<span class=\"bong_tron small\">", "");
    expNumber = helper.replaceString(expNumber, "</span>", ",");
    expNumber = expNumber.replace(/\s/g, "");
    expNumber = expNumber.substring(0, expNumber.length - 1);

    const arrNumber = expNumber.split(",");


    // set default kết quả
    let chan = 0;
    let le = 0;
    let lon = 0;
    let nho = 0;

    // loop các số và set lại giá trị cho các biến trên
    for (const i in arrNumber) {
      if (Number(arrNumber[i]) % 2 == 0) chan++; else le++;
      if (Number(arrNumber[i]) >= 41) lon++; else if (Number(arrNumber[i]) <= 40) nho++;
    }

    // tính kết quả chẵn lẻ 
    const chanleResult = (chan == le) ? "draw" : (chan > le) ? "even" : (chan < le) ? "odd" : "error";
    // tính kết quả lớn nhỏ
    const lonnhoResult = (lon == nho) ? "draw" : (lon > nho) ? "big" : (lon < nho) ? "small" : "error";

    // mảng responsive 
    const dataXoso: any = {};
    dataXoso["date"] = helper.cutstring(lastRow, "target=\"_self\">", "</a>");
    dataXoso["round"] = helper.cutstring(lastRow, "target=\"_self\">#", "</a>");
    dataXoso["result"] = arrNumber;
    dataXoso["chanleresult"] = chanleResult;
    dataXoso["lonnhoResult"] = lonnhoResult;

    const LotteryCheckExits = await LotteryCheck("keno", dataXoso["round"]);

    if(!LotteryCheckExits) {
      const dataImport: any = {
        type: "keno",
        date: dataXoso["date"],
        next: null,
        round: dataXoso["round"],
        result: JSON.stringify(dataXoso["result"])
      };

      LotteryModel.create(dataImport);      
    }

    return {
      status: true,
      data: dataXoso,
      msg: "Success"
    };

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};




const XosoPowerData = async () => {

  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/so-ket-qua?gameid=4&nocatche=1",
      "headers": {}
    };

    // lấy nội dung trang kết quả Kano
    const data = await request(options);

    // lấy nội dung bảng kết quả
    const tableResult = helper.cutstring(data, "<tbody>", "</tbody>");
    // lấy nội dung hàng mới nhất trong bảng
    const lastRow = helper.cutstring(tableResult, "<tr>", "</tr>");

    // lấy list kết quả các số
    let listNumber = helper.cutstring(tableResult, "<div class=\"day_so_ket_qua_v2\" style=\"padding-top:15px\">", "</div>");
    listNumber = listNumber.replace(/\s/g, "");

    let expNumber = helper.replaceString(listNumber, "<spanclass=\"bong_tron\">", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tronno-margin-right\">", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tron-sperator\">|</span>", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tronno-margin-right\">", "");
    expNumber = helper.replaceString(expNumber, "</span>", ",");
    expNumber = expNumber.replace(/\s/g, "");
    expNumber = expNumber.substring(0, expNumber.length - 1);
    const arrNumber = expNumber.split(",");

    const getNextTime = await XosoGetNextTime("power");

    const dataXoso: any = {};
    dataXoso["date"] = helper.cutstring(lastRow, "<td>", "</td>");
    dataXoso["round"] = helper.cutstring(lastRow, "target=\"_self\">", "</a>");
    dataXoso["result"] = arrNumber;
    dataXoso["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryCheck("power", dataXoso["round"]);

    if(!LotteryCheckExits) {
      const dataImport: any = {
        type: "power",
        date: dataXoso["date"],
        next: dataXoso["next"],
        round: dataXoso["round"],
        result: JSON.stringify(dataXoso["result"])
      };

      LotteryModel.create(dataImport);      
    }

    return {
      status: true,
      data: dataXoso,
      msg: "Success"
    };

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};




const XosoMegaData = async () => {

  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/so-ket-qua?gameid=3&nocatche=1",
      "headers": {}
    };

    // lấy nội dung trang kết quả Kano
    const data = await request(options);

    // lấy nội dung bảng kết quả
    const tableResult = helper.cutstring(data, "<tbody>", "</tbody>");
    // lấy nội dung hàng mới nhất trong bảng
    const lastRow = helper.cutstring(tableResult, "<tr>", "</tr>");

    // lấy list kết quả các số
    let listNumber = helper.cutstring(tableResult, "<div class=\"day_so_ket_qua_v2\" style=\"padding-top:15px\">", "</div>");
    listNumber = listNumber.replace(/\s/g, "");

    let expNumber = helper.replaceString(listNumber, "<spanclass=\"bong_tron\">", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tronno-margin-right\">", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tron-sperator\">|</span>", "");
    expNumber = helper.replaceString(expNumber, "<spanclass=\"bong_tronno-margin-right\">", "");
    expNumber = helper.replaceString(expNumber, "</span>", ",");
    expNumber = expNumber.replace(/\s/g, "");
    expNumber = expNumber.substring(0, expNumber.length - 1);
    const arrNumber = expNumber.split(",");

    const getNextTime = await XosoGetNextTime("mega");

    const dataXoso: any = {};
    dataXoso["date"] = helper.cutstring(lastRow, "<td>", "</td>");
    dataXoso["round"] = helper.cutstring(lastRow, "target=\"_self\">", "</a>");
    dataXoso["result"] = arrNumber;
    dataXoso["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryCheck("mega", dataXoso["round"]);

    if(!LotteryCheckExits) {
      const dataImport: any = {
        type: "mega",
        date: dataXoso["date"],
        next: dataXoso["next"],
        round: dataXoso["round"],
        result: JSON.stringify(dataXoso["result"])
      };

      LotteryModel.create(dataImport);      
    }

    return {
      status: true,
      data: dataXoso,
      msg: "Success"
    };

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};



const XosoMax4dData = async () => {

  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/max-4d.html",
      "headers": {}
    };

    // lấy nội dung trang kết quả Kano
    const data = await request(options);

    // lấy nội dung bảng kết quả
    const tableResult = helper.cutstring(data, "<div class=\"tong_day_so_ket_qua text-center\">", "<div class=\"btn_chuyendulieu\">");

    let html;
    let expNumber;
    let arrNumber;
    let list;
    const dataXoso: any = {};

    // lấy nội dung giải nhất trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Nhất</h5>", "<div class=\"clearfix visible-lg\">");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(html);
    dataXoso["giainhat"] = arrNumber;

    // lấy nội dung giải nhì trong bảng
    dataXoso["giainhi"] = {};    
    html = helper.cutstring(tableResult, "<h5>Giải Nhì</h5>", "<div class=\"clearfix visible-lg\">");
    list = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list1"] = arrNumber;

    list = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list2"] = arrNumber;

    // lấy nội dung giải ba trong bảng
    dataXoso["giaiba"] = {};    
    html = helper.cutstring(tableResult, "<h5>Giải Ba</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<!-- /day_so_ket_qua_v2 -->");

    // bóc dãy 1
    list = helper.cutstring(html[0], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list1"] = arrNumber;

    // bóc dãy 2
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list2"] = arrNumber;

    // bóc dãy 3
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list3"] = arrNumber;


    // lấy nội dung giải khuyến khích 1 trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Khuyến Khích 1</h5>", "<!-- /day_so_ket_qua_v2 -->");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich1"] = arrNumber;

    // lấy nội dung giải khuyến khích 2 trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Khuyến Khích 2</h5>", "<!-- /day_so_ket_qua_v2 -->");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich2"] = arrNumber;

    const getNextTime = await XosoGetNextTime("max4d");

    const dataExport: any = {};
    dataExport["date"] = helper.cutstring(data, "ngày <b>", "</b>");    
    dataExport["round"] = helper.cutstring(data, "<h5>Kỳ quay thưởng <b>#", "</b>");
    dataExport["result"] = dataXoso;
    dataExport["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryCheck("max4d", dataExport["round"]);

    if(!LotteryCheckExits) {
      const dataImport: any = {
        type: "max4d",
        date: dataExport["date"],
        next: dataExport["next"],
        round: dataExport["round"],
        result: JSON.stringify(dataExport["result"])
      };

      LotteryModel.create(dataImport);      
    }


    return dataExport;

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};





const XosoMax3dData = async () => {

  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/max-3d",
      "headers": {}
    };

    // lấy nội dung trang kết quả Kano
    const data = await request(options);

    // lấy nội dung bảng kết quả
    const tableResult = helper.cutstring(data, "<div class=\"box_kqtt_nd_chinh\">", "<div class=\"btn_chuyendulieu\">");

    let html;
    let expNumber;
    let arrNumber;
    let list;
    const dataXoso: any = {};

    // lấy nội dung giải nhất trong bảng
    dataXoso["giainhat"] = {};
    html = helper.cutstring(tableResult, "<h5>Giải Nhất</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-6 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhat"]["list1"] = arrNumber;

    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhat"]["list2"] = arrNumber;


    // lấy nội dung giải nhì trong bảng
    dataXoso["giainhi"] = {};
    html = helper.cutstring(tableResult, "<h5>Giải Nhì</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-3 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list1"] = arrNumber;


    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\" >", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list2"] = arrNumber;

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2 \"\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list3"] = arrNumber;

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2\" >", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"]["list4"] = arrNumber;


    // lấy nội dung giải ba trong bảng
    dataXoso["giaiba"] = {};    
    html = helper.cutstring(tableResult, "<h5>Giải Ba</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-4 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list1"] = arrNumber;

    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list2"] = arrNumber;

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list3"] = arrNumber;

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list4"] = arrNumber;

    // bóc dãy 5
    list = helper.cutstring(html[5], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list5"] = arrNumber;

    // bóc dãy 6
    list = helper.cutstring(html[6], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"]["list6"] = arrNumber;


    // lấy nội dung giải khuyến khích trong bảng
    dataXoso["giaikhuyenkhich"] = {};
    html = helper.cutstring(tableResult, "<h5>Giải khuyến khích</h5>", "<div class=\"btn_chuyendulieu\">");
    html = html.split("<div class=\"col-xs-3 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list1"] = arrNumber;

    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list2"] = arrNumber;

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list3"] = arrNumber;

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list4"] = arrNumber;

    // bóc dãy 5
    list = helper.cutstring(html[5], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list5"] = arrNumber;

    // bóc dãy 6
    list = helper.cutstring(html[6], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list6"] = arrNumber;

    // bóc dãy 7
    list = helper.cutstring(html[7], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list7"] = arrNumber;

    // bóc dãy 8
    list = helper.cutstring(html[8], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"]["list8"] = arrNumber;

    const getNextTime = await XosoGetNextTime("max4d");

    const dataExport: any = {};
    dataExport["date"] = helper.cutstring(data, "ngày <b>", "</b>");    
    dataExport["round"] = helper.cutstring(data, "<h5>Kỳ quay thưởng <b>#", "</b>");
    dataExport["result"] = dataXoso;
    dataExport["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryCheck("max3d", dataExport["round"]);

    if(!LotteryCheckExits) {
      const dataImport: any = {
        type: "max3d",
        date: dataExport["date"],
        next: dataExport["next"],
        round: dataExport["round"],
        result: JSON.stringify(dataExport["result"])
      };

      LotteryModel.create(dataImport);      
    }
    
    return dataExport;

  }catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};



export default {
  getShopeeDetail: getShopeeDetail,
  TikiCrawl: TikiCrawl,
  ShoppeCrawl: ShoppeCrawl,
  LazadaCrawl: LazadaCrawl,
  XosoKenoData,
  XosoPowerData,
  XosoMegaData,
  XosoMax3dData,
  XosoMax4dData
};