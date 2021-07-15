import { Request, Response, Router } from "express";
import { Transaction, ValidationError, ValidationErrorItem } from "sequelize";
import { sendSuccess, sendError } from "@util/response";
import sequelize from "@database/connection";

import orders from "./lottery/orders";
import history from "./lottery/geyhistorygame";

const router = Router();

router.use("/orders", orders);
router.use("/history", history);

export default router;