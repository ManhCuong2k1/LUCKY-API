import express from "express";
const router = express.Router();
import FeedController from "./FeedController";
import UserController from "./UserController";
import GroupChatController from "./GroupChatController";
import HashTagFollowerController from "./HashTagFollowerController";
import PromotionUrlController from "./PromotionUrlController";
import CheckinController from "./CheckinController";
import LotteryController from "./LotteryController";


router.use("/feeds", FeedController);
router.use("/users", UserController);
router.use("/group-chats", GroupChatController);
router.use("/hashtag-following", HashTagFollowerController);
router.use("/promotion-url", PromotionUrlController);
router.use("/checkin", CheckinController);
router.use("/lottery", LotteryController);

export default router;
