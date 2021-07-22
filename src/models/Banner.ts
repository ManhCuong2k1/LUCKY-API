import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

interface BannerInterface {
    id: number;
    image: string;
    type: string;
    index: number;
}

class Banner extends Model<BannerInterface>
    implements BannerInterface {
        public id: number;
        public image: string;
        public type: string;
        public index: number;
    }

const BannerDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
    },
    index: {
        type: DataTypes.INTEGER
    }
};

Banner.init(BannerDefine, {
    tableName: "banner",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    sequelize: connection
});

export {
    BannerInterface,
    Banner,
};
