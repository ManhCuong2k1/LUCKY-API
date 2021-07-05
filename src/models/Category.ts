import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";

interface CategoryInterface {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class CategoryModel
  extends Model<CategoryInterface>
  implements CategoryInterface
{
  public id!: number;
  public title: string;
  public slug: string;
  public description: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  static readonly scopes: ModelScopeOptions = {
    bySearch(q) {
      if (q) {
        return {
          where: {
            title: {
              [Op.substring]: q,
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

const CategoryDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(300),
  },
  slug: {
    type: DataTypes.STRING(600),
  },
  description: {
    type: DataTypes.TEXT,
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

CategoryModel.init(CategoryDefine, {
  paranoid: true,
  scopes: CategoryModel.scopes,
  tableName: "categories",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { CategoryInterface, CategoryModel };
