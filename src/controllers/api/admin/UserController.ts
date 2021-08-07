import express, { Response, Request } from "express";
import { UserInterface, UserModel } from "@models/User";
import { encryptPassword } from "@util/md5password";
import { excludeFields } from "@util/convert";
import { GridInterface } from "@models/Transformers/Grid";
import { authAdmin, authEmploye } from "../../../middleware/auth";
import moment from "moment-timezone";
import { Op } from "sequelize";
const router = express.Router();

router.get("/", authAdmin, async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;

    const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;

    const where: any = Object.assign({},
      searchKey === null ? null : { phone: { [Op.like]: `%${searchKey.trim()}%` } },
      {role : "user"},
    );

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      limit,
      offset,
    });

    const userResponse = excludeFields(rows, ["password"]);
    const responseData: GridInterface<UserInterface> = {
      data: userResponse,
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

router.get("/staff", authAdmin, async (req: Request, res: Response) => {
  try {
    const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
    const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
    const cursor: number = (page - 1) * pageSize;

    const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
    const status: string = req.query.status ? req.query.status.toString() : null;
    const fromDate: any = req.query.fromDate || null;
    const toDate: any = req.query.toDate || null;

    const where: any = Object.assign({},
      status === null ? null : { status },
      searchKey === null ? null : { name: { [Op.like]: `%${searchKey.trim()}%` } },
      fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null,
      {role : {[Op.or] : ["employe","admin"]}},
    );

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      distinct: true,
      limit: pageSize,
      offset: cursor,
      order: [
          ["createdAt", "DESC"],
      ],
    });

    const userResponse = excludeFields(rows, ["password"]);
    const responseData: GridInterface<UserInterface> = {
      data: userResponse,
      page: page,
      pageSize: pageSize,
      total: count
    };
    res.send(responseData);
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/detail/:id", async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id }, 
          { username: req.params.id }
      ],
      }
    });
    const jsonUser: any = user.toJSON();
    delete jsonUser.password;
    res.send({ data: jsonUser });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user: UserInterface = req.body;
    if (!user.username || !user.password) {
      throw new Error("Username or password invalid");
    }

    const passwordHash = encryptPassword(user.password);
    user.password = passwordHash;

    const userSaved = await UserModel.create(user);
    const jsonUser: any = userSaved.toJSON();
    delete jsonUser.password;

    res.send({ data: jsonUser });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/recharge/:id", authAdmin, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByPk(req.params.id);

    const recharge = req.body.recharge;
    if(user) {
      const number: any =  user.totalCoin + parseInt(recharge);
      user.totalCoin = number;
      await user.save();
      res.send({ data: user });
    } else {
      res.status(400).send("Cant not find user");
    }
  } catch (e) {
    res.status(400).send("err");
  }
});

router.put("/:id", authAdmin, async (req: Request, res: Response) => {
  try {
    const updateUser: UserInterface = req.body;
    const user = await UserModel.findByPk(req.params.id);

    user.name = updateUser.name;
    user.email = updateUser.email;
    user.identify = updateUser.identify;
    user.gender = updateUser.gender;
    user.dateOfBirth = updateUser.dateOfBirth;
    user.status = updateUser.status;
    user.role = updateUser.role;
    if (updateUser.password) {
      user.password = encryptPassword(updateUser.password);
    }

    await user.save();

    const jsonUser: any = user.toJSON();
    delete jsonUser.password;
    res.send({ data: jsonUser });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id/detail", authEmploye, async (req: Request, res: Response) => {
  try {
    const updateUser: UserInterface = req.body;
    const user = await UserModel.findByPk(req.params.id);

    user.name = updateUser.name;
    user.phone = updateUser.phone;
    user.email = updateUser.email;
    user.gender = updateUser.gender;
    user.dateOfBirth = updateUser.dateOfBirth;

    await user.save();

    const jsonUser: any = user.toJSON();
    delete jsonUser.password;
    res.send({ data: jsonUser });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
