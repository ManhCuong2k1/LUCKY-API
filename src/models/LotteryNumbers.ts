import { DataTypes, Model, ModelScopeOptions, Op, QueryTypes, Sequelize } from "sequelize";
import sequelize from "@database/connection";

interface LotteryNumbersInterface {
    id: number;
    userId: number;
    number: string;
    date: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryNumbersModel extends Model<LotteryNumbersInterface> implements LotteryNumbersInterface {
    public id!: number;
    public userId: number;
    public number: string;
    public date: string;
    public status: string;
    public createdAt: Date;
    public updatedAt: Date;

    static readonly STATUS_ENUM = {
        TRUE: true,
        FASLE: false
    };
}

const LotteryNumbersDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    number: {
        type: DataTypes.STRING,
    },
    date: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
};

LotteryNumbersModel.init(LotteryNumbersDefine, {
    paranoid: true,
    tableName: "lottery_numbers",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize,
});

const sortArr = (arr: any) => {
    const length = arr.length;
    for (let j = 0; j < length - 1; j++) {
        if (Number(arr[j]) > Number(arr[j + 1])) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            j = -1;
        }
    }
    return arr;
};

const getNumbers = async (date: string, status: string) => {
    const dataExport: any[] = [];
    const arrNumbers: any[] = [];

    const getNumberDB = await LotteryNumbersModel.findAll({
        where: { date, status },
        order: [["number", "ASC"]],
    });

    getNumberDB.forEach(async (data: any) => {
        if (arrNumbers.indexOf(data.number) < 0) {
            arrNumbers.push(data.number);

            const rowsCount = await LotteryNumbersModel.findAndCountAll({
                where: { number: data.number }
            });

            dataExport.push({
                number: data.number,
                total: rowsCount.count
            });
        }
    });

    return dataExport;
};

// const sayHi = async () => {
//     const hi = await getNumbers("13-08-2021", "true");
//     console.log(hi);
// };

export {
    LotteryNumbersInterface,
    LotteryNumbersModel,
    getNumbers
};