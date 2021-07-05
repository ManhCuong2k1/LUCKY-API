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
    const time = date + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec;
    return time;
};

export default {
    timeStamp,
    timeConverter
};