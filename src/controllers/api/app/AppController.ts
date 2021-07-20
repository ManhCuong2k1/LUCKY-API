import express from "express";
const router = express.Router();
import UserController from "./UserController";
import LotteryController from "./LotteryController";

router.use("/users", UserController);
router.use("/lottery", LotteryController);

export default router;
