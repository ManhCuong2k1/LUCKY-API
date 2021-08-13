import { Request, Response, Router } from "express";

import orders from "./lottery/orders";
import ordersloto from "./lottery/ordersloto";
import history from "./lottery/geyhistorygame";
import exchange from "./lottery/exchange";
import kienthietController from "./lottery/kienthiet";

const router = Router();

router.use("/orders", orders);
router.use("/ordersloto", ordersloto);
router.use("/history", history);
router.use("/exchange", exchange);
router.use("/kienthiet", kienthietController);


export default router;