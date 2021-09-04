import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";

dotenv.config();

const sendSmsOtp = async (phoneNumber: string, message: string) => {
    if (phoneNumber.charAt(0) === "0") {
      phoneNumber = phoneNumber.replace("0", "0");
    }
    
    try {
      const config: AxiosRequestConfig = {
        method: "post",
        url: "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/",
        headers: { 
          "Content-Type": "application/json", 
          "Cookie": "ASP.NET_SessionId=mqnr3acglwodhoiidxpdroxo"
        },
        data : JSON.stringify({
          "ApiKey": process.env.SMS_API_KEY,
          "Content": message,
          "Phone": phoneNumber,
          "SecretKey": process.env.SMS_SECRET_KEY,
          "Brandname": "FNOTIFY",
          "SmsType": "2",
          "campaignid": "lucky"
        })
      };

      return await axios(config);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  };
  
  export default sendSmsOtp;