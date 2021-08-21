const arrayStringToNumber = (obj: any) => {
    try {
        return obj.map((i: any) => Number(i));
    }catch (e) {
        console.log(e.message);
    }
};  

const arrNumberToString = (obj: any) => {
    try {
        return obj.map((i: any) => i.toString());
    }catch (e) {
        console.log(e.message);
    }
};

const sortRounds = (arr: any) => {
        const length = arr.length;
        for (let j = 0; j < length - 1; j++) {
            if (Number(arr[j]["round"]) > Number(arr[j + 1]["round"])) {
                const temp = arr[j]["round"];
                arr[j]["round"] = arr[j + 1]["round"];
                arr[j + 1]["round"] = temp;
                j = -1;
            }
        }
        return arr;
};

const checkSame = (arrBet: any, arrResult: any) => {
    const arrExport = [];
    for (const i of arrBet) {
        for (const j of arrResult) {
            if (i == j) {
                arrExport.push(i);
                break;
            }
        }
    }
    return arrExport;
};

const countSame = (item: any, array: any) => {
    const arrExport = [];
    for (const i of array) {
      if(item == i) {
        arrExport.push(i);
      }
    }
    return arrExport.length;
};

const removeFirstChar = (arr: any, length: number) => {
    const arrExport = [];
    for (const i of arr) {
        const str = i.substring(length);
        arrExport.push(str);
    }
    return arrExport;
};

const getRewardKeno = (level: number, same: number) => {
    const arrReward = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 20000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 90000, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20000, 200000, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 10000, 50000, 400000, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 10000, 150000, 4400000, 0, 0, 0, 0, 0],
        [0, 0, 0, 10000, 40000, 450000, 12500000, 0, 0, 0, 0],
        [0, 0, 0, 10000, 20000, 100000, 1200000, 40000000, 0, 0, 0],
        [10000, 0, 0, 0, 10000, 50000, 500000, 5000000, 200000000, 0, 0],
        [10000, 0, 0, 0, 10000, 30000, 150000, 1500000, 12000000, 800000000, 0],
        [10000, 0, 0, 0, 0, 20000, 80000, 710000, 8000000, 150000000, 2000000000],
    ];
    return arrReward[level][same];
};

const getRewardPower = (level: number, same: number) => {
    const arrReward = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 200000, 1700000, 82500000, 240000000],
        [0, 0, 0, 50000, 500000, 40000000, 30000000000],
        [0, 0, 0, 200000, 1700000, 82500000, 240000000],
        [0, 0, 0, 500000, 3800000, 128000000, 487500000],
        [0, 0, 0, 1000000, 7000000, 177000000, 743500000],
        [0, 0, 0, 1750000, 11500000, 230000000, 1009000000],
        [0, 0, 0, 2800000, 17500000, 287500000, 1285000000],
        [0, 0, 0, 4200000, 25200000, 350000000, 1572500000],
        [0, 0, 0, 6000000, 34800000, 418000000, 1872500000],
        [0, 0, 0, 8250000, 46500000, 492000000, 2186000000],
        [0, 0, 0, 11000000, 60500000, 572500000, 2514000000],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 22750000, 118300000, 858000000, 3595000000]
    ];
    return arrReward[level][same];
};


const getRewardMega = (level: number, same: number) => {
    const arrReward = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 120000, 2010000, 31400000, 390000000],
        [0, 0, 0, 30000, 300000, 10000000, 12000000000],
        [0, 0, 0, 120000, 1020000, 21500000, 60000000],
        [0, 0, 0, 300000, 2280000, 34800000, 124000000],
        [0, 0, 0, 600000, 4200000, 50200000, 194100000],
        [0, 0, 0, 1050000, 6900000, 68000000, 269400000],
        [0, 0, 0, 1680000, 10500000, 88500000, 351000000],
        [0, 0, 0, 2520000, 15120000, 112000000, 439500000],
        [0, 0, 0, 3600000, 20880000, 138800000, 535500000],
        [0, 0, 0, 4950000, 27900000, 169200000, 639600000],
        [0, 0, 0, 6600000, 36300000, 203500000, 752400000],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 13650000, 70980000, 332800000, 1.149000000]
    ];
    return arrReward[level][same];
};


const getRewardCompute636 = (same: number) => {
    const arrReward = [0, 0, 0, 15000, 100000, 1800000, 1500000000];
    return arrReward[same];
};



export default {
    arrayStringToNumber,
    arrNumberToString,
    sortRounds,
    checkSame,
    countSame,
    removeFirstChar,
    getRewardKeno,
    getRewardPower,
    getRewardMega,
    getRewardCompute636
};
