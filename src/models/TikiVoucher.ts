import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";
import {ERROR_CODES} from "@util/constants";

interface TikiVoucherInterface extends Model {
    id: number;
    category: string;
    iconname: string; 
    iconurl: string;
    label: string;
    shorttitle: string;
    status: string;
    period: string;
    couponid: number;
    expiredat: number;
    coupontype: string;
    couponcode: string;
    discountamount: number;
    longdescription: string;
    shortdescription: string;
}

const TikiVoucherDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING
    },
    iconname: {
        type: DataTypes.STRING
    },
    iconurl: {
        type: DataTypes.STRING
    },
    label: {
        type: DataTypes.STRING
    },
    shorttitle: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
    period: {
        type: DataTypes.STRING
    },
    couponid: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    expiredat: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    coupontype: {
        type: DataTypes.STRING
    },
    couponcode: {
        type: DataTypes.STRING
    },
    discountamount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    longdescription: {
        type: DataTypes.TEXT
    },
    shortdescription: {
        type: DataTypes.STRING
    }
};

const TikiVoucherModel = connection.define<TikiVoucherInterface>("tiki_voucher",TikiVoucherDefine, {
    tableName: "tiki_voucher",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
});

// Func
const findCredentials = async (couponid: string, couponcode: string, category: any) => {
    const coupon = await TikiVoucherModel.findOne({ where: { couponid: couponid, couponcode: couponcode, category: category } });
    if (coupon == null) {
        return false;
    }else {
        return true;  
    }

};

export default {
    TikiVoucherModel,
    findCredentials
};