import express from "express";
const router = express.Router();
import UserController from "./UserController";
import LotteryOrderController from "./LotteryOrderController";
import BannerController from "./BannerController";
import HistoryController from "./HistoryController";
import DashboardController from "./DashboardController";
import SettingsController from "./SettingController";
import ExchangeController from "./ExchangeController";

router.use("/users", UserController);
router.use("/lottery-order", LotteryOrderController);
router.use("/banner", BannerController);
router.use("/history", HistoryController);
router.use("/dashboard", DashboardController);
router.use("/setting", SettingsController);
router.use("/exchange", ExchangeController);

export default router;
