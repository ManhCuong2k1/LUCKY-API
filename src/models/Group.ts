import { DataTypes } from "sequelize";

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    summary: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    }
};