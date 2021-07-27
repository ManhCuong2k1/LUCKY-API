import { Request, Response, Router } from "express";
import order from "./employeAction/order";
const router = Router();

router.use("/order", order);

export default router;