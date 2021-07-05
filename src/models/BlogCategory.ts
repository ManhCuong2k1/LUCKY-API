import { Sequelize, Model, DataTypes } from "sequelize";

interface BlogCategoryInterface {
    id: number;
    slug: string;
    name: string;
}