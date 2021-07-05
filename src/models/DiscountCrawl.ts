import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

interface DiscountCrawlInterface extends Model {
    id: number;
    offer: string;
    category: string;
    categorySlug: string;
    title: string;
    subTitle: string;
    status: string;
    couponId: number;
    startAt: number;
    expiredAt: number;
    couponType: string;
    couponCode: string;
    discountAmount: number;
    longDescription: string;
    shortDescription: string;
    moreInfo: string;
    externalLinks: string;
}

const DiscountCrawlDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    offer: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },
    categorySlug: {
        type: DataTypes.STRING
    },
    title: {
        type: DataTypes.STRING
    },
    subTitle: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING,
        default: "publish"
    },
    couponId: {
        type: DataTypes.STRING
    },
    startAt: {
        type: DataTypes.INTEGER
    },
    expiredAt: {
        type: DataTypes.INTEGER
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
    externalLinks: {
        type: DataTypes.STRING
    }
};

const DiscountCrawlModel = connection.define<DiscountCrawlInterface>("discount_crawl",DiscountCrawlDefine, {
    tableName: "discount_crawl",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
});

const checkExisted = async <Boolean>(offer: string, couponCode: string) => {
    const coupon = await DiscountCrawlModel.findOne({ 
        where: { 
            couponCode,
            offer,
        } 
    });
    return coupon != null;
};

export {
    DiscountCrawlInterface,
    DiscountCrawlModel,
    checkExisted
};
