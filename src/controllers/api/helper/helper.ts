const timeStamp = () => {
    return Math.floor(Date.now() / 1000);
};

const timeConverter = (timestamp: number) => {
    const a = new Date(timestamp * 1000);
    const months = ["01", "02", "03", "04", "05", "06", "07", "07", "08", "09", "10", "12"];
    const year = a.getFullYear();
    const month = months[a.getMonth() + 1];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = year + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
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

const getTimeData = (string: string) => {
    // format 2021/07/24 17:45:00
    return new Date(string);
};


const countCharExits = (string: string, word: string) => {
    const count = string.split(word).length - 1;
 
    let stringExport = "";
 
    for(let i = 1; i <= count; i++) {
        stringExport += word;
    }
 
    return stringExport;
};

const numberformat = (nStr: any) => {
    nStr += "";
    const x = nStr.split(".");
    let x1 = x[0];
    const x2 = x.length > 1 ? "." + x[1] : "";
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "." + "$2");
    }
    return x1 + x2;
};


const checkItemExist = (array1: any, array2: any) => {
    const arrExport = [];

    for(const i in array1) {
        for(const i2 in array2) {
            if(array1[i] == array2[i2]) {
                arrExport.push(array1[i]);
            }
        }
    }

    return arrExport;
};


const employeStringToSignalCode = (arrString: any) => {

    const arrConvert: any = {
        "0":    "0",
        "1":    "1",
        "2":    "2",
        "3":    "3",
        "4":    "4",
        "5":    "5",
        "6":    "6",
        "7":    "7",
        "8":    "8",
        "9":    "9",
        "a":    "A",
        "b":    "B",
        "c":    "C",
        "d":    "D",
        "e":    "E",
        "f":    "F",
        "1ky":  "Y",
        "2ky":  "O",
        "3ky":  "o",
        "4ky":  "U",
        "5ky":  "P",
        "6ky":  "{",
        "bao5": "G",
        "bao7": "H",
        "bao8": "J",
        "bao9": "K",
        "baokhac": "L",
        "10k":  "!",
        "20k":  "@",
        "50k":  "#",
        "100k": "$",
        "200k": "%",
        "500k": "^",
        "1000k":"&",
        "lock": "1",
        "exit": "S",
        "func": "s",
        "recall": "c",
        "cancel": "v",
        "help":   "h",
        "report": "b",
        "print":  "r",
        "sales":  "n",
        "pay":    "V",
        "6tren45": "l",
        "6tren55": "k",
        "keno":    "d",
        "3d":      "N",
        "3dplus":  "q",
        "4d":      "y",
        "4dtohop": "u",
        "4dcuon1": "M",
        "4dbao":   "m",
        "4dcuon4": "<",
        "khac":     "*",
        "tuchon":   "I",
        "arrowdown":"[",
        "arrowup":  "]",
        "arrowleft":"không rõ",
        "clear":    "xxx",
        "dot":      ".",
        "send":     "x",
        "total":    "t"
    };
    const signalArray: any = [];

    arrString.forEach((string: any) => {
        signalArray.push(arrConvert[string]);
    });
    
    return signalArray;
};

export default {
    timeStamp,
    getTime,
    timeConverter,
    addMinuteToTime,
    getTimeData,
    numberformat,
    checkItemExist,
    employeStringToSignalCode
};