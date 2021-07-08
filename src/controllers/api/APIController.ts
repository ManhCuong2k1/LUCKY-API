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

// Tiki Router
router.use("/tikivoucher", TikiVoucherController);
// Shoppe Router
router.use("/shopeevoucher", ShoppeVoucherController);
// Lazada Router
router.use("/lazadavoucher", LazadaVoucherController);

// Shoppe Api Masoffer
router.use("/shopee", ShopeeMasofferController);
// Shoppe Item Get
router.use("/shopee-item", ShopeeItemController);
// Init Crawl Category

// Check Shopee Voucher
router.use("/validate-voucher", CheckShopeeController);

// API XoSo
router.use("/xoso", XosoController);


export default router;