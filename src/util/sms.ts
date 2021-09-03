import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";

dotenv.config();

const sendSmsOtp = async (phoneNumber: string, message: string) => {
    if (phoneNumber.charAt(0) === "0") {
      phoneNumber = phoneNumber.replace("0", "0");
    }
    
    try {
      const config: AxiosRequestConfig = {
        method: "get",
        url: "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone="+phoneNumber+"&Content="+message+"&ApiKey="+process.env.SMS_API_KEY+"&SecretKey="+process.env.SMS_SCRET_KEY+"&SmsType=2&Brandname=FNOTIFY",
        headers: { 
          "Cookie": "ASP.NET_SessionId=vgqyosn3t0mh4uxhswgvyfpo"
        }
      };
      return await axios(config);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  };
  
  export default sendSmsOtp;