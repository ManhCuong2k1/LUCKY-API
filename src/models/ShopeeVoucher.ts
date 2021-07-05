import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

interface ShopeeVoucherInterface extends Model {
    id: number;
    category: string;
    disabled: boolean;
    discountvalue: number;
    starttime: number;
    endtime: number;
    icontext: string;
    maxvalue: number;
    minspend: number;
    productlimit: boolean;
    promotionid: number;
    shopid: number;
    shoplogo: string;
    shopname: string;
    signature: string;
    status: number;
    usagelimitperuser: number;
    usageterms: string;
    vouchercode: string;
}

const ShopeeVoucherDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING
    },
    disabled: {
        type: DataTypes.BOOLEAN
    },
    discountvalue: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    starttime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    endtime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    icontext: {
        type: DataTypes.STRING
    },
    maxvalue: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    minspend: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    productlimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    promotionid: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    shopid: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    shoplogo: {
        type: DataTypes.STRING
    },
    shopname : {
        type: DataTypes.STRING
    },
    signature: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    usagelimitperuser: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    usageterms: {
        type: DataTypes.STRING
    },
    vouchercode: {
        type: DataTypes.STRING
    }
};

const ShopeeVoucherModel = connection.define<ShopeeVoucherInterface>("shopee_voucher",ShopeeVoucherDefine, {
    tableName: "shopee_voucher",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
});

// Func
const findCredentials = async (promotionid: string, vouchercode: string, category: any) => {
    const coupon = await ShopeeVoucherModel.findOne({ where: { promotionid: promotionid, vouchercode: vouchercode, category: category } });
    if (coupon == null) {
        return false;
    }else {
        return true;  
    }

};

export default{
    ShopeeVoucherModel,
    findCredentials
};