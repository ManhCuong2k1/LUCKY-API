import sequelize from "@database/connection";
import { UserModel } from "./User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import { UserHistoryModel } from "@models/LotteryUserHistory";
import { LotteryNotifyModel } from "@models/LotteryNotify";
import { SettingsModel } from "@models/LotterySettings";


LotteryOrdersModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.hasMany(LotteryOrdersModel, { as: "orders", constraints: false, foreignKey: "ticketId"});
LotteryTicketModel.hasMany(LotteryImagesModel, { as: "image", constraints: false });
LotteryRechargeModel.belongsTo(UserModel, { as: "user", constraints: false });
UserHistoryModel.belongsTo(UserModel, { as: "user", constraints: false, foreignKey: "userId"  });
UserModel.hasMany(LotteryNotifyModel, { as: "user_notify", constraints: false, foreignKey: "userId" });
SettingsModel;

const models = sequelize.sync({ alter: true, logging: false });

export { models };