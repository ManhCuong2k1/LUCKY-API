import helper from "./Helper";
import appHelper from "../../api/helper/helper";
import request from "request-promise";
import { LotteryResultsModel, LotteryResultsCheck } from "@models/LotteryResults";
import moment from "moment-timezone";
import { replace } from "lodash";
import { LotteryPeriodsCheck, LotteryPeriodsModel } from "@models/LotteryPeriod";
moment.tz.setDefault("Asia/Ho_Chi_Minh");


const XosoGetNextTime = async (type: string) => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://vietlott.vn",
      "headers": {}
    };

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
      message: "Success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
    };
  }
};

const XosoGetJackPot = async (type: string) => {
  try {

    let jackpot: any, jackpot1: any, jackpot2: any, cutjack1: any, cutjack2: any;

    switch (type) {
      case "keno":
        jackpot = 2000000000;
        return {
          jackpot: jackpot,
        };
        break;
      case "power":
        const options = {
          "method": "GET",
          "rejectUnauthorized": false,
          "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/655.html",
          "headers": {}
        };

        const dataResp = await request(options);
        cutjack1 = helper.cutstring(dataResp, "<td>Jackpot 1</td>", "</tr>");
        jackpot1 = helper.cutstring(cutjack1, "<td class=\"color_red text-right\"><b>", "</b></td>");
        cutjack2 = helper.cutstring(dataResp, "<td>Jackpot 2</td>", "</tr>");
        jackpot2 = helper.cutstring(cutjack2, "<td class=\"color_red text-right\"><b>", "</b></td>");
        return {
          jackpot1: jackpot1,
          jackpot2: jackpot2,
        };
        break;
      case "mega":
        const optionsmega = {
          "method": "GET",
          "rejectUnauthorized": false,
          "url": "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645.html",
          "headers": {}
        };
        const dataRespmega = await request(optionsmega);
        jackpot = helper.cutstring(dataRespmega, "<td class=\"color_red text-right\"><b>", "</b></td>");
        return {
          jackpot: jackpot
        };
        break;
    }
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
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
    dataXoso["total"] = {
      chan,
      le,
      lon,
      nho
    };
    dataXoso["result"] = arrNumber;
    dataXoso["chanleresult"] = chanleResult;
    dataXoso["lonnhoResult"] = lonnhoResult;

    const LotteryCheckExits = await LotteryResultsCheck("keno", dataXoso["round"]);

    const arrImport: any = {};
    arrImport["chanle"] = dataXoso["chanleresult"];
    arrImport["lonnho"] = dataXoso["lonnhoResult"];
    arrImport["total"] = {
      chan,
      le,
      lon,
      nho
    };
    arrImport["data"] = dataXoso["result"];


    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: "keno",
        date: dataXoso["date"],
        next: null,
        round: dataXoso["round"],
        result: JSON.stringify(arrImport)
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: dataXoso,
      message: "Success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
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

    const LotteryCheckExits = await LotteryResultsCheck("power", dataXoso["round"]);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: "power",
        date: dataXoso["date"],
        next: dataXoso["next"],
        round: dataXoso["round"],
        result: JSON.stringify(dataXoso["result"])
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: dataXoso,
      message: "Success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
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

    const LotteryCheckExits = await LotteryResultsCheck("mega", dataXoso["round"]);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: "mega",
        date: dataXoso["date"],
        next: dataXoso["next"],
        round: dataXoso["round"],
        result: JSON.stringify(dataXoso["result"])
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: dataXoso,
      message: "Success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
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
    dataXoso["giainhat"] = [];
    html = helper.cutstring(tableResult, "<h5>Giải Nhất</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-6 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhat"].push(arrNumber.join(""));
    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhat"].push(arrNumber.join(""));


    // lấy nội dung giải nhì trong bảng
    dataXoso["giainhi"] = [];
    html = helper.cutstring(tableResult, "<h5>Giải Nhì</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-3 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));


    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\" >", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2 \"\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2\" >", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));


    // lấy nội dung giải ba trong bảng
    dataXoso["giaiba"] = [];
    html = helper.cutstring(tableResult, "<h5>Giải Ba</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<div class=\"col-xs-4 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 5
    list = helper.cutstring(html[5], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 6
    list = helper.cutstring(html[6], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));


    // lấy nội dung giải khuyến khích trong bảng
    dataXoso["giaikhuyenkhich"] = [];
    html = helper.cutstring(tableResult, "<h5>Giải khuyến khích</h5>", "<div class=\"btn_chuyendulieu\">");
    html = html.split("<div class=\"col-xs-3 padding_2\">");

    // bóc dãy 1
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));
    // bóc dãy 2
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 3
    list = helper.cutstring(html[3], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 4
    list = helper.cutstring(html[4], "<div class=\"day_so_ket_qua_v2 \">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);

    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 5
    list = helper.cutstring(html[5], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 6
    list = helper.cutstring(html[6], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 7
    list = helper.cutstring(html[7], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    // bóc dãy 8
    list = helper.cutstring(html[8], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaikhuyenkhich"].push(arrNumber.join(""));

    const getNextTime = await XosoGetNextTime("max3d");

    const dataExport: any = {};
    dataExport["date"] = helper.cutstring(data, "ngày <b>", "</b>");
    dataExport["round"] = helper.cutstring(data, "<h5>Kỳ quay thưởng <b>#", "</b>");
    dataExport["result"] = dataXoso;
    dataExport["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryResultsCheck("max3d", dataExport["round"]);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: "max3d",
        date: dataExport["date"],
        next: dataExport["next"],
        round: dataExport["round"],
        result: JSON.stringify(dataExport["result"])
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: dataExport,
      message: "success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
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
    dataXoso["giainhat"] = [];
    dataXoso["giainhi"] = [];
    dataXoso["giaiba"] = [];
    dataXoso["giaikhuyenkhich1"] = [];
    dataXoso["giaikhuyenkhich2"] = [];

    // lấy nội dung giải nhất trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Nhất</h5>", "<div class=\"clearfix visible-lg\">");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(html);

    dataXoso["giainhat"].push(arrNumber.join(""));

    // lấy nội dung giải nhì trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Nhì</h5>", "<div class=\"clearfix visible-lg\">");
    list = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));

    list = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giainhi"].push(arrNumber.join(""));

    // lấy nội dung giải ba trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Ba</h5>", "<div class=\"clearfix visible-lg\">");
    html = html.split("<!-- /day_so_ket_qua_v2 -->");

    // bóc dãy 1
    list = helper.cutstring(html[0], "<div class=\"day_so_ket_qua_v2 \" style=\"padding-right:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 2
    list = helper.cutstring(html[1], "<div class=\"day_so_ket_qua_v2 align_left_up_768\" style=\"padding-left:10px\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));

    // bóc dãy 3
    list = helper.cutstring(html[2], "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(list);
    dataXoso["giaiba"].push(arrNumber.join(""));


    // lấy nội dung giải khuyến khích 1 trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Khuyến Khích 1</h5>", "<!-- /day_so_ket_qua_v2 -->");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(html);
    dataXoso["giaikhuyenkhich1"].push(arrNumber.join(""));

    // lấy nội dung giải khuyến khích 2 trong bảng
    html = helper.cutstring(tableResult, "<h5>Giải Khuyến Khích 2</h5>", "<!-- /day_so_ket_qua_v2 -->");
    html = helper.cutstring(html, "<div class=\"day_so_ket_qua_v2\">", "</div>");
    arrNumber = helper.shortReplaceSpan(html);
    dataXoso["giaikhuyenkhich2"].push(arrNumber.join(""));

    const getNextTime = await XosoGetNextTime("max4d");

    const dataExport: any = {};
    dataExport["date"] = helper.cutstring(data, "ngày <b>", "</b>");
    dataExport["round"] = helper.cutstring(data, "<h5>Kỳ quay thưởng <b>#", "</b>");
    dataExport["result"] = dataXoso;
    dataExport["next"] = getNextTime.next;

    const LotteryCheckExits = await LotteryResultsCheck("max4d", dataExport["round"]);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: "max4d",
        date: dataExport["date"],
        next: dataExport["next"],
        round: dataExport["round"],
        result: JSON.stringify(dataExport["result"])
      };

      LotteryResultsModel.create(dataImport);
    }


    return {
      status: true,
      data: dataExport,
      message: "Success"
    };

  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: e.message
    };
  }
};



const getKenoCurrentRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://www.minhchinh.com/livekqxs/xstt/KN.php?_=" + helper.randomString(13),
      "headers": {}
    };

    // lấy nội dung kỳ quay số  kết quả Kano
    const dataResp = await request(options);
    let objData: any = helper.cutstring(dataResp, "xsdt[8]=", "; key=");
    objData = JSON.parse(objData);
    const dataExport: any = {};
    dataExport["current_round"] = "00" + objData.next_ky;
    dataExport["finish_time"] = objData.next_date;
    return {
      status: true,
      data: dataExport,
      message: "success"
    };


  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message
    };
  }

};



const XosoMienBac = async () => {
  try {
    //const today = moment().format("YYYY-MM-DD");
    //const today2 = moment("DD-MM-YYYY").format();
    const today = "2021-08-30";
    const today2 = "30-08-2021";
    const roundId = moment().format("YYYYMMDD");
    const currentDate = moment().format("DD/MM/YYYYY");

    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://xoso360.com/in-ve-so/22/1/" + today + "/1?t=" + helper.randomString(13),
      "headers": {}
    };

    // lấy nội dung kỳ quay số  kết quả
    const dataResp = await request(options);

    if (dataResp.includes("Không có kết quả") == true) {
      return {
        status: false,
        message: "Chưa có kết quả cho ngày " + today
      };
    } else {
      const dataXoso: any = {};

      dataXoso["date"] = today;
      dataXoso["round"] = moment(today).format("YYYYMMDD");
      dataXoso["result"] = {};
      dataXoso["result"]["code"] = [];
      dataXoso["result"]["giaidacbiet"] = [];
      dataXoso["result"]["giainhat"] = [];
      dataXoso["result"]["giainhi"] = [];
      dataXoso["result"]["giaiba"] = [];
      dataXoso["result"]["giaitu"] = [];
      dataXoso["result"]["giainam"] = [];
      dataXoso["result"]["giaisau"] = [];
      dataXoso["result"]["giaibay"] = [];

      const optionsGetCode = {
        "method": "GET",
        "rejectUnauthorized": false,
        "url": "https://ketqua247.com/xsmb-" + today2 + ".html?t=" + helper.randomString(13),
        "headers": {}
      };

      // lấy nội dung mã code 
      const dataRespGetCode = await request(optionsGetCode);
      const tableCode = helper.cutstring(dataRespGetCode, "<td colspan=\"2\"> <div>", "</td>");
      let replaceString: any = helper.replaceString(tableCode, "\n", "");
      replaceString = helper.replaceString(replaceString, "<span class=\"text-number\">", "");
      replaceString = helper.replaceString(replaceString, "</div>", "");
      replaceString = helper.replaceString(replaceString, "</span>", ",");
      replaceString = helper.replaceString(replaceString, " ", "");
      replaceString = replaceString.slice(0, -1);
      const arrCode = replaceString.split(",");
      if (arrCode.length > 3) {
        dataXoso["result"]["code"] = arrCode;

        // lấy nội dung bảng kết quả
        const tableResult = helper.cutstring(dataResp, "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"bot\">", "</table>");

        let html;
        let arrNumber;

        // lấy nội dung giải db trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        dataXoso["result"]["giaidacbiet"] = helper.cutstring(html, "f3b\" colspan=\"12\">", "</td>");
        // lấy nội dung giải nhat trong bảng
        dataXoso["result"]["giainhat"] = helper.cutstring(html, "f2\" colspan=\"12\">", "</td>");

        // lấy nội dung giải nhi trong bảng
        html = helper.cutstring(html, "<h3>Giải Nhì</h3>", "</tr>");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<td class=\"bor f2\" colspan=\"6\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giainhi"] = arrNumber;

        // lấy nội dung giải ba trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        html = helper.cutstring(html, "<h3>Giải Ba</h3>", "<td class=\"span-2 bol f1b\">");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<tr>", "");
        html = helper.replaceString(html, "</tr>", "");
        html = helper.replaceString(html, "<td class=\"bol f2\" colspan=\"4\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giaiba"] = arrNumber;

        // lấy nội dung giải tu trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        html = helper.cutstring(html, "<h3>Giải Tư</h3>", "</tr>");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<td class=\"bol f2\" colspan=\"3\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giaitu"] = arrNumber;

        // lấy nội dung giải nam trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        html = helper.cutstring(html, "<h3>Giải Năm</h3>", "<td class=\"span-2 bol f1b\">");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<tr>", "");
        html = helper.replaceString(html, "</tr>", "");
        html = helper.replaceString(html, "<td class=\"bol f2\" colspan=\"4\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giainam"] = arrNumber;

        // lấy nội dung giải sau trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        html = helper.cutstring(html, "<h3>Giải Sáu</h3>", "</tr>");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<td class=\"bol f2\" colspan=\"4\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giaisau"] = arrNumber;

        // lấy nội dung giải bay trong bảng
        html = helper.cutstring(tableResult, "<tbody>", "</tbody>");
        html = helper.cutstring(html, "<h3>Giải Bảy</h3>", "</tr>");
        html = helper.replaceString(html, "</td>", "");
        html = helper.replaceString(html, "<td class=\"bol f2\" colspan=\"3\">", ",");
        html = helper.replaceString(html, "\n", "");
        html = html.substring(1);
        arrNumber = html.split(",");
        dataXoso["result"]["giaibay"] = arrNumber;


        const LotteryCheckExits = await LotteryResultsCheck(LotteryResultsModel.GAME_ENUM.XOSOMIENBAC, roundId);

        if (!LotteryCheckExits) {
          const dataImport: any = {
            type: LotteryResultsModel.GAME_ENUM.XOSOMIENBAC,
            date: currentDate,
            next: moment().add(1, "days").format("YYYY/MM/DD 18:15:00"),
            round: roundId,
            result: JSON.stringify(dataXoso)
          };

          LotteryResultsModel.create(dataImport);
        }


        return {
          status: true,
          data: dataXoso,
          message: "Success"
        };
      } else {
        return {
          status: false,
          message: "Chưa có kết quả cho ngày " + today
        };
      }
    }

  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message
    };
  }
};

const Xoso6x36 = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/lottery-results?productid=9",
      "headers": {}
    };

    // lấy nội dung kỳ quay số  kết quả
    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const TimeOfData = dataResp.termDate.split("/");
    const TimeMomentInput = TimeOfData[1] + "-" + TimeOfData[0] + "-" + TimeOfData[2];


    const roundId = moment(new Date(TimeMomentInput)).format("YYYYMMDD");
    const result = dataResp.result.split(",");
    const date = moment(new Date(TimeMomentInput)).format("DD/MM/YYYY");

    const LotteryCheckExits = await LotteryResultsCheck(LotteryResultsModel.GAME_ENUM.COMPUTE636, roundId);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: LotteryResultsModel.GAME_ENUM.COMPUTE636,
        date: date,
        next: moment().add(1, "days").format("YYYY/MM/DD 18:15:00"),
        round: roundId,
        result: JSON.stringify(result)
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: {
        round: roundId,
        result,
        date
      },
      message: "Success"
    };

  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message
    };
  }
};


const DienToan123 = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/lottery-results?productid=11",
      "headers": {}
    };

    // lấy nội dung kỳ quay số  kết quả
    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const TimeOfData = dataResp.termDate.split("/");
    const TimeMomentInput = TimeOfData[1] + "-" + TimeOfData[0] + "-" + TimeOfData[2];

    const roundId = TimeOfData[2] + TimeOfData[1] + TimeOfData[0];
    const result = dataResp.result.split(",");
    const date = moment(new Date(TimeMomentInput)).format("DD/MM/YYYY");

    const LotteryCheckExits = await LotteryResultsCheck(LotteryResultsModel.GAME_ENUM.COMPUTE123, roundId);

    if (!LotteryCheckExits) {
      const dataImport: any = {
        type: LotteryResultsModel.GAME_ENUM.COMPUTE123,
        date: date,
        next: moment().add(1, "days").format("YYYY/MM/DD 18:15:00"),
        round: roundId,
        result: JSON.stringify(result)
      };

      LotteryResultsModel.create(dataImport);
    }

    return {
      status: true,
      data: {
        round: roundId,
        date,
        result
      },
      message: "Success"
    };

  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message
    };
  }
};



const LotoCrawl = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://rongbachkim.com/ketqua.php?getkq&ngay=&days=1&wday=0",
      "headers": {}
    };
    // lấy nội dung kỳ quay số  kết quả
    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);
    dataResp = dataResp[0];

    const today = moment().format("YYYY-MM-DD");
    const roundId = moment().format("YYYYMMDD");
    const date = moment().format("DD/MM/YYYY");


    if (dataResp[0] == today) {
      const dataExport: any[] = [];
      for (const number of dataResp[1]) {
        const numberLastChar = number.slice(-2);;
        if (numberLastChar >= 2) {
          dataExport.push(numberLastChar);
        }
      }

      const LotteryCheckExits = await LotteryResultsCheck(LotteryResultsModel.GAME_ENUM.LOTORESULT, roundId);

      if (!LotteryCheckExits) {
        const dataImport: any = {
          type: LotteryResultsModel.GAME_ENUM.LOTORESULT,
          date: date,
          next: moment().add(1, "days").format("YYYY/MM/DD 18:15:00"),
          round: roundId,
          result: JSON.stringify(dataExport)
        };
        LotteryResultsModel.create(dataImport);
      }


      return {
        status: true,
        data: {
          date,
          round: roundId,
          result: dataExport
        },
        message: "Success"
      };
    } else {
      return {
        status: false,
        message: "Chưa có kết quả cho ngày " + today
      };
    }

  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message
    };
  }
};


const getPowerRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/product/2",
      "headers": {}
    };

    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const dataExport = [];

    for (const data of dataResp.term) {
      const date = moment(appHelper.formatInputMoment(data.date));
      date.set("hour", 18);
      date.set("minute", 30);
      date.set("second", 0);
      date.set("millisecond", 0);
      const roundID = data.termString.split("#")[1];

      const LotteryCheckExits = await LotteryPeriodsCheck(LotteryResultsModel.GAME_ENUM.POWER, roundID);
      if (!LotteryCheckExits) {
        const dataImport: any = {
          type: LotteryResultsModel.GAME_ENUM.POWER,
          roundId: roundID,
          time: Number(moment(date).format("X")) * 1000
        };
        LotteryPeriodsModel.create(dataImport);
      }

      dataExport.push({
        round: roundID,
        time: Number(moment(date).format("X")) * 1000
      });

    }


    return {
      status: true,
      data: dataExport,
      jackpot: await XosoGetJackPot("power")
    };

  } catch (e) {
    console.log(e.message);
  }
};

const getMegaRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/product/1",
      "headers": {}
    };

    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const dataExport = [];

    for (const data of dataResp.term) {
      const date = moment(appHelper.formatInputMoment(data.date));
      date.set("hour", 18);
      date.set("minute", 30);
      date.set("second", 0);
      date.set("millisecond", 0);
      const roundID = data.termString.split("#")[1];

      const LotteryCheckExits = await LotteryPeriodsCheck(LotteryResultsModel.GAME_ENUM.MEGA, roundID);
      if (!LotteryCheckExits) {
        const dataImport: any = {
          type: LotteryResultsModel.GAME_ENUM.MEGA,
          roundId: roundID,
          time: Number(moment(date).format("X")) * 1000
        };
        LotteryPeriodsModel.create(dataImport);
      }


      dataExport.push({
        round: roundID,
        time: Number(moment(date).format("X")) * 1000
      });
    }

    return {
      status: true,
      data: dataExport,
      jackpot: await XosoGetJackPot("mega")
    };

  } catch (e) {
    console.log(e.message);
  }
};



const getMax3DRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/product/4",
      "headers": {}
    };

    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const dataExport = [];

    for (const data of dataResp.term) {
      const date = moment(appHelper.formatInputMoment(data.date));
      date.set("hour", 18);
      date.set("minute", 30);
      date.set("second", 0);
      date.set("millisecond", 0);
      const roundID = data.termString.split("#")[1];

      const LotteryCheckExits = await LotteryPeriodsCheck(LotteryResultsModel.GAME_ENUM.MAX3D, roundID);
      if (!LotteryCheckExits) {
        const dataImport: any = {
          type: LotteryResultsModel.GAME_ENUM.MAX3D,
          roundId: roundID,
          time: Number(moment(date).format("X")) * 1000
        };
        LotteryPeriodsModel.create(dataImport);
      }


      dataExport.push({
        round: roundID,
        time: Number(moment(date).format("X")) * 1000
      });
    }

    return {
      status: true,
      data: dataExport
    };

  } catch (e) {
    console.log(e.message);
  }
};

const getMax4DRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://api.vietluck.vn/api/v1/product/3",
      "headers": {}
    };

    let dataResp = await request(options);
    dataResp = JSON.parse(dataResp);

    const dataExport = [];

    for (const data of dataResp.term) {
      const date = moment(appHelper.formatInputMoment(data.date));
      date.set("hour", 18);
      date.set("minute", 30);
      date.set("second", 0);
      date.set("millisecond", 0);
      const roundID = data.termString.split("#")[1];

      const LotteryCheckExits = await LotteryPeriodsCheck(LotteryResultsModel.GAME_ENUM.MAX4D, roundID);
      if (!LotteryCheckExits) {
        const dataImport: any = {
          type: LotteryResultsModel.GAME_ENUM.MAX4D,
          roundId: roundID,
          time: Number(moment(date).format("X")) * 1000
        };
        LotteryPeriodsModel.create(dataImport);
      }


      dataExport.push({
        round: roundID,
        time: Number(moment(date).format("X")) * 1000
      });
    }

    return {
      status: true,
      data: dataExport
    };

  } catch (e) {
    console.log(e.message);
  }
};

export default {
  XosoGetJackPot,
  XosoKenoData,
  XosoPowerData,
  XosoMegaData,
  XosoMax3dData,
  XosoMax4dData,
  getKenoCurrentRound,
  XosoMienBac,
  Xoso6x36,
  DienToan123,
  LotoCrawl,
  getPowerRound,
  getMegaRound,
  getMax3DRound,
  getMax4DRound
};