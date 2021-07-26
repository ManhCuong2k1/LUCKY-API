import express, { Response, Request } from "express";
import { UserInterface, UserModel } from "@models/User";
import { encryptPassword } from "@util/crypto";
import { excludeFields } from "@util/convert";
import { GridInterface } from "@models/Transformers/Grid";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;

    const { rows, count } = await UserModel.findAndCountAll({
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

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
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

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updateUser: UserInterface = req.body;
    const user = await UserModel.findByPk(req.params.id);

    user.name = updateUser.name;
    user.phone = updateUser.phone;
    user.nickname = updateUser.nickname;
    user.email = updateUser.email;
    user.gender = updateUser.gender;
    user.dateOfBirth = updateUser.dateOfBirth;
    user.status = updateUser.status;
    user.isEnableReceiveEmail = updateUser.isEnableReceiveEmail;
    user.avatar = updateUser.avatar;
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

export default router;
