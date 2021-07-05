import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

interface CrawlVoucherInterface extends Model {
    id: number;
    category: string;
    label: string;
    title: string;
    status: string;
    couponId: number;
    expiredAt: number;
    couponType: string;
    couponCode: string;
    discountAmount: number;
    longDescription: string;
    shortDescription: string;
    moreInfo: string;
}

const CrawlVoucherDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING
    },
    label: {
        type: DataTypes.STRING
    },
    title: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
    couponId: {
        type: DataTypes.STRING
    },
    expiredAt: {
        type: DataTypes.STRING
    },
    couponType: {
        type: DataTypes.STRING
    },
    couponCode: {
        type: DataTypes.STRING
    },
    discountAmount: {
        type: DataTypes.STRING
    },
    longDescription: {
        type: DataTypes.TEXT
    },
    shortDescription: {
        type: DataTypes.STRING
    },
    moreInfo: {
        type: DataTypes.TEXT
    },
};

const CrawlVoucherModel = connection.define<CrawlVoucherInterface>("crawl_voucher",CrawlVoucherDefine, {
    tableName: "crawl_voucher",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
});

const checkExisted = async <Boolean>(couponId: string, couponCode: string, category: string) => {
    const coupon = await CrawlVoucherModel.findOne({ 
        where: { 
            couponId,
            couponCode,
            category
        } 
    });
    return coupon != null;
};

export default {
    CrawlVoucherModel,
    checkExisted
};
