import request from "request";

const crawlPage = (url: any, option: any) => {
    try {
        return new Promise((resolve, reject) => {
            request(url, function (err: any, res: any, body: any) {
                if(err) {
                    reject(err);
                }else {
                    resolve(body);
                }
            });
        });
    }catch(err) {
        console.log(err);
        return err;
    }
};

const cutstring = (string: string, start: string, end: string) => {
    const nd1 = string.split(start);
    const nd2 = nd1[1].split(end);
    return nd2[0];
};

const replaceString = (string: string, search: string, replace: string) => {
    let stringExport = string;
    stringExport = stringExport.split(search).join(replace);
    return stringExport;
};

const arrayStringToNumber = (obj: any) => {
    return obj.map((i: any) => Number(i));
};  

const shortReplaceSpan = (string: any) => {
    let exportString;
    exportString = replaceString(string, "<span class=\"bong_tron tiny\">", "");
    exportString = replaceString(exportString, "<span class=\"bong_tron tiny no-margin-right\">", "");
    exportString = replaceString(exportString, "</span>", ",");
    exportString = exportString.replace(/\s/g, "");
    exportString = exportString.substring(0, exportString.length - 1);
    exportString = exportString.split(",");
    return exportString;
};

const randomString = (length: any) => {
    const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
        const randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

// kiểm tra xem có phải json hay không  ???
const isJson = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

const timeStamp = function () {
    return Math.floor(Date.now() / 1000);
};


export default {
    crawlPage,
    cutstring,
    replaceString,
    arrayStringToNumber,
    shortReplaceSpan,
    randomString,
    isJson,
    timeStamp
};