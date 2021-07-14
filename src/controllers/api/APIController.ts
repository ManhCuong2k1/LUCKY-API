import express from "express";
import AuthController from "./auth/AuthController";
import AdminController from "./admin/AdminController";
import UploadController from "./upload/UploadImageController";
import AppController from "./app/AppController";
import { auth, authorAdmin } from "../../middleware/auth";

import TikiVoucherController from "./crawl/TikiController";
import ShoppeVoucherController from "./crawl/ShoppeController";
import LazadaVoucherController from "./crawl/LazadaController";

import CheckShopeeController from "./crawl/CheckShopeeController";
import ShopeeMasofferController from "./crawl/ShopeeMasofferController";
import ShopeeItemController from "./crawl/ShopeeItemController";
import XosoController from "./crawl/XosoController";

const router = express.Router();

router.use("/auth", AuthController);
router.use("/admin", AdminController);
router.use("/app", auth, AppController);
router.use("/upload", UploadController);

// API XoSo
router.use("/xoso", XosoController);


export default router;