import express, { Response, Request } from "express";
import { AdminInterface, AdminModel } from "@models/Admin";
import { excludeFields } from "@util/convert";
import { GridInterface } from "@models/Transformers/Grid";
import { authAdmin } from "../../../middleware/auth";
const router = express.Router();

router.get("/", authAdmin, async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;

    const { rows, count } = await AdminModel.scope([
      "withTotalFeed",
      { method: ["bySearch", query.searchKey] },
      { method: ["byDateRange", query.startDate, query.endDate] },
    ]).findAndCountAll({
      limit,
      offset,
    });

    const adminResponse = excludeFields(rows, ["password"]);
    const responseData: GridInterface<AdminInterface> = {
      data: adminResponse,
      page: page,
      pageSize: limit,
      total: count,
    };
    res.send(responseData);
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", authAdmin, async (req: Request, res: Response) => {
  try {
    const admin = await AdminModel.findByPk(req.params.id);
    const jsonAdmin: any = admin.toJSON();
    delete jsonAdmin.password;
    res.send({ data: jsonAdmin });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/", authAdmin, async (req: Request, res: Response) => {
  try {
    const admin: AdminModel = req.body;
    if (!admin.username || !admin.password) {
      throw new Error("Username or password invalid");
    }

    const adminSaved = await AdminModel.create(admin);
    const jsonAdmin: any = adminSaved.toJSON();
    delete jsonAdmin.password;

    res.send({ data: jsonAdmin });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", authAdmin, async (req: Request, res: Response) => {
  try {
    const updateAdmin = req.body;
    const admin: any = await AdminModel.findByPk(req.params.id);
    const UPDATABLE_PARAMETERS = [
      "name",
      "phone",
      "nickname",
      "email",
      "gender",
      "dateOfBirth",
      "status",
      "isEnableReceiveEmail",
      "avatar",
      "password",
    ];

    UPDATABLE_PARAMETERS.forEach((param) => {
      admin[param] = updateAdmin[param];
    });

    await admin.save();

    const jsonAdmin: any = admin.toJSON();
    delete jsonAdmin.password;
    res.send({ data: jsonAdmin });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
