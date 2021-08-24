import dotenv from "dotenv";
import querystring from "qs";
import crypto from "crypto";  
import dateformat from "dateformat";

dotenv.config();

class VnpPayment {
  public vnpUrl: string;
  public ipAccess: string;
  public orderInfo: string;
  public amount: number;
  public bankCode: string;
  public orderId: string;
  public orderDescription: string;
  public orderType: string;
  public locale: string;
  public currCode: string;
  public date: Date;
  public createDate: string;

  constructor() {
    this.vnpUrl = (this.vnpUrl == null || this.vnpUrl == "" || this.vnpUrl === "undefined") ? process.env.VNP_URL : this.vnpUrl;
    this.bankCode = (this.bankCode == null || this.bankCode == "") ? "" : this.bankCode;
    this.locale = (this.locale == null || this.locale == "") ? "vn" : this.locale;
    this.currCode = (this.currCode == null || this.currCode == "") ? "VND" : this.currCode;
    this.date = (this.date == null) ? new Date() : this.date;
    this.createDate = dateformat(this.date, "yyyymmddHHmmss");
  }

  public async makePayment() {
    let VNP_PARAMS: any = {};
    VNP_PARAMS["vnp_Version"] = "2.1.0";
    VNP_PARAMS["vnp_Command"] = "pay";
    VNP_PARAMS["vnp_TmnCode"] = process.env.VNP_TMNCODE;
    // VNP_PARAMS['vnp_Merchant'] = ''
    VNP_PARAMS["vnp_Locale"] = this.locale;
    VNP_PARAMS["vnp_CurrCode"] = this.currCode;
    VNP_PARAMS["vnp_TxnRef"] = this.orderId;
    VNP_PARAMS["vnp_OrderInfo"] = this.orderInfo;
    VNP_PARAMS["vnp_OrderType"] = this.orderType;
    VNP_PARAMS["vnp_Amount"] = this.amount * 100;
    VNP_PARAMS["vnp_ReturnUrl"] = process.env.VNP_RETURN_URL;
    VNP_PARAMS["vnp_IpAddr"] = this.ipAccess;
    VNP_PARAMS["vnp_CreateDate"] = this.createDate;
    VNP_PARAMS["vnp_BankCode"] = this.bankCode;
    VNP_PARAMS = this.sortObject(VNP_PARAMS);
    const signData = querystring.stringify(VNP_PARAMS, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.VNP_HASHSCRET);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex"); 
    VNP_PARAMS["vnp_SecureHash"] = signed;
    this.vnpUrl += "?" + querystring.stringify(VNP_PARAMS, { encode: false });
    return this.vnpUrl;
  }

  public sortObject = (o: any) => {
    const sorted: any = {};
    let key: any;
    const a = [];
    for (key in o) {
      if (o.hasOwnProperty(key)) {
        a.push(encodeURIComponent(key));
      }
    }
    a.sort();
    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = encodeURIComponent(o[a[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}


export default VnpPayment;