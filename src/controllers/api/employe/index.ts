import { Request, Response, Router } from "express";
import orderController from "./employeAction/order";
import updateController from "./employeAction/update";
const router = Router();

router.use("/order", orderController);
router.use("/update", updateController);

export default router;