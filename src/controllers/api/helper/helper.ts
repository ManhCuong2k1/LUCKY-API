import { times } from "lodash";

const timeStamp = () => {
    return Math.floor(Date.now() / 1000);
};

const timeConverter = (timestamp: number) => {
    const a = new Date(timestamp * 1000);
    const months = ["01", "02", "03", "04", "05", "06", "07", "07", "08", "09", "10", "12"];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = year + "-" + date + "-" + month + " " + hour + ":" + min + ":" + sec;
    return time;
};

const getTime = (timeStamp: any) => {
    // chuỗi timestamp không nhân với 1000 
    return new Date(timeStamp * 1000);
};

const addMinuteToTime = (time: any, minutes: number) => {
    const parseTime = new Date(time);
    let timeStamp = parseTime.setTime(parseTime.getTime() + (minutes * 60 * 1000));
        timeStamp = timeStamp / 1000;
    return timeConverter(timeStamp);
};

export default {
    timeStamp,
    getTime,
    timeConverter,
    addMinuteToTime
};