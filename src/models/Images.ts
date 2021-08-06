import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

interface ImageAttributes {
    id: number;
    imageUrl: string;
    UserId: string;
}

class Image extends Model<ImageAttributes>
    implements ImageAttributes {
        public id: number;
        public imageUrl: string;
        public UserId: string;
    }

const ImageDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    UserId: {
        type: DataTypes.STRING
    }
};

Image.init(ImageDefine, {
    tableName: "images",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    paranoid: true,
    sequelize: connection
});

export {
    Image
};
