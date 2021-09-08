import { Router } from "express";
import orderController from "./employeAction/order";
import orderKenoController from "./employeAction/orderkeno";
import updateController from "./employeAction/update";
const router = Router();

router.use("/order", orderController);
router.use("/orderkeno", orderKenoController);
router.use("/update", updateController);

export default router;