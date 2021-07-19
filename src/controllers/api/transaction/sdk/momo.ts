import hmacSHA256 from "crypto-js/hmac-sha256";
import dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";

dotenv.config();

class MomoPayment {
  public orderId: string;
  public amount: string;
  public requestId: string;
  public orderInfo: string;


  constructor () {
    this.orderInfo = (this.orderInfo == null || this.orderInfo ==  "") ? "Thanh Toán Qua Momo" : this.orderInfo;
  }

  public async makePayment () {
    const data = {
      accessKey: process.env.MOMO_ACCESS_KEY,
      partnerCode: process.env.MOMO_PARTNER_CODE,
      requestType: "captureMoMoWallet",
      returnUrl: `${process.env.HOST_URL}/api/transaction/endpoint/momo`,
      notifyUrl: `${process.env.HOST_URL}/api/transaction/endpoint/momo`,
      orderId: this.orderId,
      amount: this.amount,
      requestId: this.requestId,
      orderInfo: this.orderInfo,
      extraData: "",
      signature: this.generateMakePaymentSignature(),
    };
    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: process.env.MOMO_GET_PAYMENT_ENDPOINT,
      data: data,
    };
    const result = await axios(requestConfig);
    return result.data;
  };

  public async verifyPayment () {
    const data = {
      accessKey: process.env.MOMO_ACCESS_KEY,
      partnerCode: process.env.MOMO_PARTNER_CODE,
      requestType: "transactionStatus",
      orderId: this.orderId,
      requestId: this.requestId,
      signature: this.generateVerifyPaymentSignature(),
    };

    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: process.env.MOMO_GET_PAYMENT_ENDPOINT,
      data: data,
    };
    const result = await axios(requestConfig);
    return result.data.errorCode === 0;
  }

  private generateMakePaymentSignature () {
    const signature = hmacSHA256(`partnerCode=${process.env.MOMO_PARTNER_CODE}` +
      `&accessKey=${process.env.MOMO_ACCESS_KEY}` +
      `&requestId=${this.requestId}` +
      `&amount=${this.amount}` +
      `&orderId=${this.orderId}` +
      `&orderInfo=${this.orderInfo}` +
      `&returnUrl=${process.env.HOST_URL}/api/transaction/endpoint/momo` +
      `&notifyUrl=${process.env.HOST_URL}/api/transaction/endpoint/momo` +
      "&extraData=", process.env.MOMO_SECRET_KEY).toString();
    return signature;
  }

  private generateVerifyPaymentSignature () {
    const signature = hmacSHA256(`partnerCode=${process.env.MOMO_PARTNER_CODE}` +
      `&accessKey=${process.env.MOMO_ACCESS_KEY}` +
      `&requestId=${this.requestId}` +
      `&orderId=${this.orderId}` +
      "&requestType=transactionStatus", process.env.MOMO_SECRET_KEY).toString();
    return signature;
  }
}

export default MomoPayment;