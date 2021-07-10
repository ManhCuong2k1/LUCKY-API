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

const checkResult = (level: number, same: number) => {
    const arrReward = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 20000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 90000, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20000, 200000, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 10000, 50000, 400000, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 10000, 150000, 4400000, 0, 0, 0, 0, 0],
        [0, 0, 0, 10000, 40000, 450000, 12500000, 0, 0, 0, 0],
        [0, 0, 0, 10000, 20000, 100000, 1200000, 40000000, 0, 0, 0],
        [10, 0, 0, 0, 10000, 50000, 500000, 5000000, 200000000, 0, 0],
        [10, 0, 0, 0, 10000, 30000, 150000, 1500000, 12000000, 800000000, 0],
        [10, 0, 0, 0, 0, 20000, 80000, 710000, 8000000, 150000000, 2000000000],
    ];
    return arrReward[level][same];
};

const arrayStringToNumber = (obj: any) => {
    return obj.map((i: any) => Number(i));
};  

export default {
    checkSame,
    checkResult,
    arrayStringToNumber
};
