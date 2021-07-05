import { DataTypes, Model, ModelScopeOptions, Op } from "sequelize";
import sequelize from "@database/connection";
import { CategoryInterface } from "@models/Category";

interface BlogInterface {
  id: number;
  title: string;
  slug: string;
  brief: string;
  content: string;
  avatar: string;
  status: string;
  categoryId: number;
  category?: CategoryInterface;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class BlogModel extends Model<BlogInterface> implements BlogInterface {
  public id!: number;
  public title: string;
  public slug: string;
  public brief: string;
  public content: string;
  public avatar: string;
  public status: string;
  public categoryId: number;
  public category?: CategoryInterface;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = {
    Draft: "draft",
    Published: "published",
    Checking: "checking",
    Checked: "checked",
  };

  static readonly scopes: ModelScopeOptions = {
    bySearch(searchKey) {
      if (searchKey) {
        return {
          where: {
            title: {
              [Op.substring]: searchKey,
            },
          },
        };
      }

      return {
        where: {},
      };
    },
    byDateRange(from, to) {
      if (from && to) {
        return {
          where: {
            createdAt: { [Op.between]: [from, to] },
          },
        };
      }

      return {
        where: {},
      };
    },
  };
}

const BlogDefine = {
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
  brief: {
    type: DataTypes.STRING(500),
  },
  content: {
    type: DataTypes.TEXT,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(BlogModel.STATUS_ENUM) }),
    defaultValue: BlogModel.STATUS_ENUM.Draft,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

BlogModel.init(BlogDefine, {
  paranoid: true,
  scopes: BlogModel.scopes,
  tableName: "blogs",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { BlogInterface, BlogModel };
