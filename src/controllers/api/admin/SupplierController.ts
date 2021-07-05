import { Router, Request, Response } from "express";
import { SupplierInterface, SupplierModel } from "@models/Supplier";
import { GridInterface } from "@models/Transformers/Grid";
import _ from "lodash";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;
    const where = { status: query.status };

    const { rows, count } = await SupplierModel.scope([
      { method: ["bySearch", query.searchKey] },
    ]).findAndCountAll({
      where: _.pickBy(where, (value) => value !== undefined),
      limit,
      offset,
    });

    const responseData: GridInterface<SupplierInterface> = {
      data: rows,
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

router.post("/", async (req: Request, res: Response) => {
  try {
    const supplierCreate: SupplierInterface = req.body;

    const supplier = await SupplierModel.create(supplierCreate);
    res.send({ data: supplier });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const supplier = await SupplierModel.findByPk(req.params.id);
    const supplierUpdate: SupplierInterface = req.body;

    supplier.name = supplierUpdate.name;
    supplier.isHome = supplierUpdate.isHome;
    supplier.avatar = supplierUpdate.avatar;
    supplier.status = supplierUpdate.status;
    supplier.description = supplierUpdate.description;
    supplier.slug = supplierUpdate.slug;

    await supplier.save();
    res.send({ data: supplier });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supplier = await SupplierModel.findByPk(req.params.id);

    res.send({ data: supplier });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
