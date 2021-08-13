import { DataTypes, Model, ModelScopeOptions, Op, QueryTypes, Sequelize } from "sequelize";
import sequelize from "@database/connection";

interface LotteryNumbersInterface {
    id: number;
    number: string;
    total: number;
    date: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

class LotteryNumbersModel extends Model<LotteryNumbersInterface> implements LotteryNumbersInterface {
    public id!: number;
    public number: string;
    public total: number;
    public date: string;
    public status: string;
    public createdAt: Date;
    public updatedAt: Date;

    static readonly STATUS_ENUM = {
        TRUE: "true",
        FASLE: "false"
    };
}

const LotteryNumbersDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    number: {
        type: DataTypes.STRING,
    },
    total: {
        type: DataTypes.INTEGER,
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


const getNumbers = async (date: string, status: string) => {
    const dataExport: any[] = [];
    const arrNumbers: any[] = [];

    const getNumberDB = await LotteryNumbersModel.findAll({
        where: { date, status },
        order: [["number", "ASC"]],
    });

    for (const data of getNumberDB) {
        if (arrNumbers.indexOf(data.number) < 0) {
            arrNumbers.push(data.number);
            dataExport.push({
                number: data.number,
                total: data.total
            });
        }
    }

    return dataExport;
};

const getOneNumber = async (number: string, date: string, status: string) => {
    const numberDB = await LotteryNumbersModel.findOne({
        where: {
            number,
            date,
            status
        }
    });
    return numberDB;
};


export {
    LotteryNumbersInterface,
    LotteryNumbersModel,
    getNumbers,
    getOneNumber
};