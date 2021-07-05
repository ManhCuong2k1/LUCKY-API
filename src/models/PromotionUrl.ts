import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";

interface PromotionUrlInterface {
  id: number;
}

class PromotionUrlModel extends Model<PromotionUrlInterface>
  implements PromotionUrlInterface {
    public id!: number;
  }

const PromotionUrlDefine = {
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  }
};

PromotionUrlModel.init(PromotionUrlDefine, {
  tableName: "promotion_urls",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export {
  PromotionUrlInterface,
  PromotionUrlModel
};
