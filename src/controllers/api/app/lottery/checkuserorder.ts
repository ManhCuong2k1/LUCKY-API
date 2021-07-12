import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
const router = Router();