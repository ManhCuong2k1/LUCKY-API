import { DataTypes, Model, STRING } from "sequelize";
import connection from "@database/connection";
import {ERROR_CODES} from "@util/constants";

interface LazadaVoucherInterface extends Model {
    id: number;
    category: string;
    newVoucherType: string;
    originVoucherDiscountValue: number;
    originVoucherMinOrderAmount: number;
    useNowUrl: string;
    voucherCanApply: number;
    voucherChannel: number;
    voucherCollectEndDate: number;
    voucherCollectStartDate: number;
    voucherCurrency: string;
    voucherDescriptionvi: string;
    voucherDiscountType: number;
    voucherDiscountValue: string;
    voucherId: string;
    voucherMinOrderAmount: string;
    voucherMainTitle: string;
    voucherResolvedStatus: string;
    voucherSpreadId: string;
    voucherStatus: number;
    voucherTagDesc: string;
    voucherTitle: string;
    voucherTotalBudget: number;
    voucherType: number;
    voucherUrl: string;
    voucherUsageLimitPerCustomer: number;
    voucherUseEndDate: number;
    voucherUseStartDate: number;
    voucherUserCollectTimes: string;
}

const LazadaVoucherDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING
    },
    newVoucherType: {
        type: DataTypes.STRING
    },
    originVoucherDiscountValue: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    originVoucherMinOrderAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    useNowUrl: {
        type: DataTypes.STRING
    },
    voucherCanApply: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherChannel: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherCollectEndDate: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    voucherCollectStartDate: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    voucherCurrency: {
        type: DataTypes.STRING
    },
    voucherDescriptionvi: {
        type: DataTypes.STRING
    },
    voucherDiscountType: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherDiscountValue: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherMinOrderAmount : {
        type: DataTypes.STRING
    },
    voucherMainTitle: {
        type: DataTypes.STRING
    },
    voucherResolvedStatus: {
        type: DataTypes.STRING
    },
    voucherSpreadId: {
        type: DataTypes.STRING
    },
    voucherStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherTagDesc: {
        type: DataTypes.STRING
    },
    voucherTitle: {
        type: DataTypes.STRING
    },
    voucherTotalBudget: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherType: {
        type: DataTypes.INTEGER,
        defaultValue: 0   
    },
    voucherUrl: {
        type: DataTypes.STRING
    },
    voucherUsageLimitPerCustomer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    voucherUseEndDate: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    voucherUseStartDate: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    voucherUserCollectTimes: {
        type: DataTypes.STRING
    },
};

const LazadaVoucherModel = connection.define<LazadaVoucherInterface>("lazada_voucher", LazadaVoucherDefine, {
    tableName: "lazada_voucher",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
});

// Func
const findCredentials = async (voucherSpreadId: string, category: any) => {
    const coupon = await LazadaVoucherModel.findOne({ where: { voucherSpreadId: voucherSpreadId, category: category } });
    if (coupon == null) {
        return false;
    }else {
        return true;  
    }

};

export default{
    LazadaVoucherModel,
    findCredentials
};