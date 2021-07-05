import { Router, Request, Response } from "express";
import { GroupChatModel, GroupChatInterface } from "@models/GroupChat";
import { UserModel } from "@models/User";
import { AdminModel } from "@models/Admin";
import { Op } from "sequelize";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const groupChats = await GroupChatModel.scope([
      "withTotalMember",
      "withTotalMessage",
    ]).findAll();

    res.send({ data: groupChats });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/members/:id", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const page: number = parseInt(!!query.page ? query.page.toString() : "1");
    const limit: number = parseInt(
      !!query.pageSize ? query.pageSize.toString() : "20"
    );
    const offset: number = (page - 1) * limit;
    const where: any = {};
    if (query.searchKey) {
      where.name = {
        [Op.substring]: query.searchKey,
      };
    }

    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const members = await groupChat.getMembers({ where, limit, offset });
    const totalMember = await groupChat.countMembers({ where });

    res.send({ data: members, page, pageSize: limit, total: totalMember });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/admins/:id", async (req: Request, res: Response) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const admins = await groupChat.getAdmins();

    res.send({ data: admins });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const groupChatCreate: GroupChatInterface = req.body;
    const groupChat = await GroupChatModel.create(groupChatCreate);

    res.send({ data: groupChat });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/members/:id", async (req: Request, res: Response) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const users = await UserModel.findAll({ where: { id: req.body.userIds } });
    const addedUsers: any = await groupChat.addMembers(users);
    if (!addedUsers) {
      return res.send({ data: [] });
    }

    res.send({
      data: users.filter(
        (user) =>
          addedUsers.find((addedUser: any) => addedUser.userId === user.id) !==
          undefined
      ),
    });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.post("/admins/:id", async (req: Request, res: Response) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const admins = await AdminModel.findAll({
      where: { id: req.body.adminIds },
    });
    const addedAdmins: any = await groupChat.addAdmins(admins);
    if (!addedAdmins) {
      return res.send({ data: [] });
    }

    res.send({
      data: admins.filter(
        (admin) =>
          addedAdmins.find(
            (addedAdmin: any) => addedAdmin.adminId === admin.id
          ) !== undefined
      ),
    });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);

    res.send({ data: groupChat });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const groupChatUpdate = req.body;
    const groupChat: any = await GroupChatModel.findByPk(req.params.id);
    const UPDATABLE_PARAMETERS = [
      "groupSocketId",
      "name",
      "slug",
      "description",
      "sensitiveWords",
      "status",
    ];

    UPDATABLE_PARAMETERS.forEach((param) => {
      groupChat[param] = groupChatUpdate[param];
    });
    await groupChat.save();

    res.send({ data: groupChat });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    await groupChat.destroy();

    res.send({ data: groupChat });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.delete("/members/:id", async (req, res) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const users = await UserModel.findAll({ where: { id: req.body.userIds } });
    await groupChat.removeMembers(users);

    res.send({ data: users });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.delete("/admins/:id", async (req, res) => {
  try {
    const groupChat = await GroupChatModel.findByPk(req.params.id);
    const admins = await AdminModel.findAll({
      where: { id: req.body.adminIds },
    });
    await groupChat.removeAdmins(admins);

    res.send({ data: admins });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

export default router;
