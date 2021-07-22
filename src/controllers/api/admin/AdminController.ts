import express from "express";
const router = express.Router();
import UserController from "./UserController";
import LotteryOrderController from "./LotteryOrderController";
import BannerController from "./BannerController";

router.use("/users", UserController);
router.use("/lottery-order", LotteryOrderController);
router.use("/banner", BannerController);

export default router;
