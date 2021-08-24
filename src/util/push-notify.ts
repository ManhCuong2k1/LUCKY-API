import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PushNotify = async (to: string, title: string, body: string) => {

    const data: any = JSON.stringify({
        "to": to,
        "notification": {
            "title": title,
            "body": body,
            "sound": "default"
        }
    });

    const sendNotity = await axios({
        method: "post",
        url: "https://fcm.googleapis.com/fcm/send",
        headers: {
            "Authorization": "key=" + process.env.FCM_KEY,
            "Content-Type": "application/json"
        },
        data: data
    });
    
    return sendNotity;
};


export default PushNotify;