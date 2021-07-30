import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";
import qs from "qs";

dotenv.config();

const sendSmsOtp = async (phoneNumber: string, message: string) => {
    if (phoneNumber.charAt(0) === "0") {
      phoneNumber = phoneNumber.replace("0", "+84");
    }
    const data = qs.stringify({
      Body: message,
      From: process.env.SMS_PHONE_NUMBER,
      To: phoneNumber,
    });
    try {
      const config: AxiosRequestConfig = {
        method: "POST",
        url: `https://api.twilio.com/2010-04-01/Accounts/${process.env.SMS_OTP_SID}/Messages.json`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: process.env.SMS_OTP_SID,
          password: process.env.SMS_AUTH_TOKEN,
        },
        data: data,
      };
      return await axios(config);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  };
  
  export default sendSmsOtp;