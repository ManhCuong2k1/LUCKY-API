import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import sequelize from "@database/connection";
import { UserModel } from "./User";
import { RoleModel } from "./Role";
import { LotteryModel } from "@models/Lottery";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import { LotteryExchangesModel } from "./LotteryExchange";


// LotteryModel.belongsTo(UserModel, { constraints: false});

LotteryOrdersModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.hasMany(LotteryOrdersModel, { as: "orders", constraints: false, foreignKey: "ticketId"});
LotteryTicketModel.hasMany(LotteryImagesModel, { as: "image", constraints: false });
LotteryRechargeModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryExchangesModel.belongsTo(UserModel, { as: "user", constraints: false });
// LotteryImagesModel.belongsTo(LotteryTicketModel, { as: "image", constraints: false });


UserModel.belongsTo(RoleModel, { as: "role", constraints: false });

const models = sequelize.sync({ alter: true, logging: false });

export { models };
