import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface HashTagInterface {
  id: number;
  slug: string;
  name: string;
  image: string;
  isPublished: boolean;
}

class HashTagModel extends Model<HashTagInterface> implements HashTagInterface {
  public id!: number;
  public slug: string;
  public name: string;
  public image: string;
  public isPublished: boolean;

  static readonly scopes: ModelScopeOptions = {
    bySlug(slug) {
      return {
        where: { slug },
      };
    },
    bySearch(searchKey) {
      if (searchKey) {
        return {
          where: {
            name: {
              [Op.substring]: searchKey,
            },
          },
        };
      }

      return {
        where: {},
      };
    },
  };
}

const HashTagDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
};

HashTagModel.init(HashTagDefine, {
  indexes: [{ unique: true, fields: ["slug"] }],
  scopes: HashTagModel.scopes,
  tableName: "hashtags",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { HashTagInterface, HashTagModel };
