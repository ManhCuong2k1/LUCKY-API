import express from "express";
import AuthController from "./auth/AuthController";
import AdminController from "./admin/AdminController";
import UploadController from "./upload/UploadImageController";
import AppController from "./app/AppController";
import { auth, authorAdmin } from "../../middleware/auth";

import XosoController from "./crawl/XosoController";
import EmployeController from "./employe";
import TransactionController from "./transaction/TransactionControlller";


const router = express.Router();

router.use("/auth", AuthController);
router.use("/admin", AdminController);
router.use("/app", auth, AppController);
router.use("/upload", UploadController);
router.use("/transaction", TransactionController);
// API XoSo
router.use("/xoso", XosoController);
router.use("/employe", EmployeController);

export default router;