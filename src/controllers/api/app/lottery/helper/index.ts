

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

const checkSameArrString = (arrBet: any, arrResult: any) => {
    const arrExport = [];
    for (const i of arrayStringToNumber(arrBet)) {
        for (const j of arrayStringToNumber(arrResult)) {
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

const checkRewardKhuyenKhich = (numb1: any, numb2: any) => {
    const number1 = String(numb1).split("");
    const number2 = String(numb2).split("");  
  
    if(number1[0] != numb2[0]) return false;
  
    number1.shift(),number2.shift();
  
    let countError = 0;
  
    for(let i = 0; i <= number2.length - 1; i++) {
      if(number1.indexOf(number2[i]) < 0) {
        countError++;
      }else {
        number1.splice(number1.indexOf(number2[i]) , 1);
      }
    }
    if(countError >= 2) return false;else return true;
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
        [0, 0, 200000, 3850000, 104000000, 6024000000, 34920000000],
        [0, 0, 0, 50000, 500000, 40000000, 30000000000],
        [0, 0, 0, 200000, 1700000, 82500000, 3042500000],
        [0, 0, 0, 500000, 3800000, 128000000, 3088000000, 30487500000, 33247500000],
        [0, 0, 0, 1000000, 7000000, 177000000, 3137000000, 30743500000, 33503500000],
        [0, 0, 0, 1750000, 11500000, 230000000, 3190000000, 31000000000, 33769000000],
        [0, 0, 0, 2800000, 17500000, 287500000, 3247500000, 31280000000, 34040000000],
        [0, 0, 0, 4200000, 25200000, 350000000, 3310000000, 31570000000, 34330000000],
        [0, 0, 0, 6000000, 34800000, 418000000, 3378000000, 31870000000, 34630000000],
        [0, 0, 0, 8250000, 46500000, 492000000, 3452000000, 32180000000, 34940000000],
        [0, 0, 0, 11000000, 60500000, 572500000, 3532500000, 35270000000, 35270000000],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 22750000, 118300000, 858000000, 3818000000, 33590000000, 36350000000]
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
        [0, 0, 120000, 2010000, 31400000, 12390000000],
        [0, 0, 0, 30000, 300000, 10000000, 12000000000],
        [0, 0, 0, 120000, 1020000, 21500000, 1260000000],
        [0, 0, 0, 300000, 2280000, 34800000, 12124500000],
        [0, 0, 0, 600000, 4200000, 50200000, 12194100000],
        [0, 0, 0, 1050000, 6900000, 68000000, 12269400000],
        [0, 0, 0, 1680000, 10500000, 88500000, 12351000000],
        [0, 0, 0, 2520000, 15120000, 112000000, 12439500000],
        [0, 0, 0, 3600000, 20880000, 138800000, 12535500000],
        [0, 0, 0, 4950000, 27900000, 169200000, 12639600000],
        [0, 0, 0, 6600000, 36300000, 203500000, 12752400000],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 13650000, 70980000, 332800000, 13149000000]
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
    checkSameArrString,
    countSame,
    checkRewardKhuyenKhich,
    removeFirstChar,
    getRewardKeno,
    getRewardPower,
    getRewardMega,
    getRewardCompute636
};
