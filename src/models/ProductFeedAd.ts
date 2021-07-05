import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface ProductFeedAdInterface {
  id: number;
  productLinks: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class ProductFeedAdModel
  extends Model<ProductFeedAdInterface>
  implements ProductFeedAdInterface
{
  public id!: number;
  public productLinks: string;
  public startTime: Date;
  public endTime: Date;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly UPDATABLE_PARAMETERS = [
    "productLinks",
    "startTime",
    "endTime",
  ];
}

const ProductFeedAdDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productLinks: {
    type: DataTypes.TEXT,
    set(value: string[]) {
      this.setDataValue("productLinks", JSON.stringify(value));
    },
    get(): string[] {
      if (!this.getDataValue("productLinks")) {
        return [];
      }
      return JSON.parse(this.getDataValue("productLinks"));
    },
  },
  startTime: {
    type: DataTypes.DATE,
  },
  endTime: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
};

ProductFeedAdModel.init(ProductFeedAdDefine, {
  paranoid: true,
  tableName: "product_feed_ads",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { ProductFeedAdInterface, ProductFeedAdModel };
