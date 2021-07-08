import { Request, Response, Router } from "express";
import { Transaction, ValidationError, ValidationErrorItem } from "sequelize";
import { sendSuccess, sendError } from "@util/response";
import sequelize from "@database/connection";


import getmoneyorder from "./lottery/getmoneyorder";
import lotteryOrder from "./lottery/orders";


const router = Router();


router.use("/getmoneyorder", getmoneyorder);
router.use("/orders", lotteryOrder);



export default router;