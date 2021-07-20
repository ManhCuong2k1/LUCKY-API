import express from "express";
const router = express.Router();
import UserController from "./UserController";
import LotteryOrderController from "./LotteryOrderController";

router.use("/users", UserController);
router.use("/lottery-order", LotteryOrderController);

export default router;
