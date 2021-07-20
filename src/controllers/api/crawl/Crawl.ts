import helper from "./Helper";
import request from "request-promise";
import axios from "axios";
import { LotteryModel, LotteryCheck } from "@models/Lottery";


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

  } catch (e) {
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
    dataXoso["total"] = {
      chan,
      le,
      lon,
      nho
    };
    dataXoso["result"] = arrNumber;
    dataXoso["chanleresult"] = chanleResult;
    dataXoso["lonnhoResult"] = lonnhoResult;

    const LotteryCheckExits = await LotteryCheck("keno", dataXoso["round"]);

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

      LotteryModel.create(dataImport);
    }

    return {
      status: true,
      data: dataXoso,
      msg: "Success"
    };

  } catch (e) {
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

    if (!LotteryCheckExits) {
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

  } catch (e) {
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

    if (!LotteryCheckExits) {
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

  } catch (e) {
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

    if (!LotteryCheckExits) {
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

  } catch (e) {
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

    if (!LotteryCheckExits) {
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

  } catch (e) {
    console.log(e);
    return {
      status: false,
      msg: e.message
    };
  }
};

const getKenoCurrentRound = async () => {
  try {
    const options = {
      "method": "GET",
      "rejectUnauthorized": false,
      "url": "https://www.minhchinh.com/livekqxs/xstt/KN.php?_="+ helper.randomString(13),
      "headers": {}
    };

    // lấy nội dung kỳ quay số  kết quả Kano
    const dataResp = await request(options);
    let objData: any = helper.cutstring(dataResp, "xsdt[8]=", "; key=");
        objData = JSON.parse(objData);
    const dataExport: any = {};
    dataExport["current_round"] = "00"+ objData.next_ky;
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
      msg: error.message
    };
  }

};


export default {
  XosoKenoData,
  XosoPowerData,
  XosoMegaData,
  XosoMax3dData,
  XosoMax4dData,
  getKenoCurrentRound
};