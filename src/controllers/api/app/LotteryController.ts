import { Request, Response, Router } from "express";
import { Transaction, ValidationError, ValidationErrorItem } from "sequelize";
import { sendSuccess, sendError } from "@util/response";
import sequelize from "@database/connection";


import getmoneyorder from "./lottery/getmoneyorder";
import orders from "./lottery/orders";
import history from "./lottery/history";

const router = Router();


router.use("/getmoneyorder", getmoneyorder);
router.use("/orders", orders);
router.use("/history", history);



export default router;