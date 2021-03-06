import sequelize from "@database/connection";
import { UserModel } from "./User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { LotteryRechargeModel } from "@models/LotteryRecharge";
import { UserHistoryModel } from "@models/LotteryUserHistory";
import { LotteryNotifyModel } from "@models/LotteryNotify";
import { LotteryExchangesModel } from "@models/LotteryExchanges";
import { LotteryPeriodsModel } from "./LotteryPeriod";
import { LotteryStoragesModel } from "./LotteryStorage";
import { StatusGamesModel } from "./LotteryStatusGames";
import { Image } from "@models/Images";


LotteryOrdersModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.belongsTo(UserModel, { as: "user", constraints: false });
LotteryTicketModel.hasMany(LotteryOrdersModel, { as: "orders", constraints: false, foreignKey: "ticketId"});
LotteryTicketModel.hasMany(LotteryImagesModel, { as: "image", constraints: false });
LotteryRechargeModel.belongsTo(UserModel, { as: "user", constraints: false });
UserHistoryModel.belongsTo(UserModel, { as: "user", constraints: false, foreignKey: "userId"  });
UserModel.hasMany(LotteryNotifyModel, { as: "user_notify", constraints: false, foreignKey: "userId" });
UserModel.hasMany(Image, { as: "user", constraints: false, foreignKey: "UserId" });
LotteryExchangesModel.belongsTo(UserModel, { as: "user_exchange", constraints: false, foreignKey: "userId" });
StatusGamesModel;
const models = sequelize.sync({ alter: true, logging: false });

export { models };