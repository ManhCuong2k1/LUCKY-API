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
import { UserHistoryModel } from "@models/LotteryUserHistory";
import { LotteryNotifyModel } from "@models/LotteryNotify";


// LotteryModel.belongsTo(UserModel, { constraints: false});

LotteryOrdersModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.hasMany(LotteryOrdersModel, { as: "orders", constraints: false, foreignKey: "ticketId"});
LotteryTicketModel.hasMany(LotteryImagesModel, { as: "image", constraints: false });
LotteryRechargeModel.belongsTo(UserModel, { as: "user", constraints: false });
UserHistoryModel.belongsTo(UserModel, { as: "user", constraints: false, foreignKey: "userId"  });
// UserModel.hasMany(UserHistoryModel, { as: "history", constraints: false, foreignKey: "userId" });
UserModel.hasMany(LotteryNotifyModel, { as: "user_notify", constraints: false, foreignKey: "userId" });

// LotteryImagesModel.belongsTo(LotteryTicketModel, { as: "image", constraints: false });


UserModel.belongsTo(RoleModel, { as: "role", constraints: false });

const models = sequelize.sync({ alter: true, logging: false });

export { models };
