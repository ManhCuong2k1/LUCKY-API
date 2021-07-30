import { ValidationError, ValidationErrorItem } from "sequelize";
import express, { Response, Request } from "express";
import { generateAuthToken, findCredentials, findCredentialAdmin, UserModel, findPhone, UserInterface, generateOtpCode, forgotPassword } from "@models/User";
import { sendSuccess, sendError } from "@util/response";
import { auth, authAdmin, authEmploye } from "@middleware/auth";
import { encryptPassword } from "@util/md5password";

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: API đăng nhập tài khoản
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Tài khoản đăng nhập"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            username:
 *              type: "string"
 *            password:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return user data & accessToken.
 *       401:
 *         description: Get credentials failed.
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await findCredentials(username, password);
    const token: string = await generateAuthToken(user);
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON, token });
  } catch (e) {
    res.status(401).send({
      code: e.message,
    });
  }
});

router.post("/loginAdmin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await findCredentialAdmin(username, password);
    const token: string = await generateAuthToken(user);
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON, token });
  } catch (e) {
    res.status(401).send({
      code: e.message,
    });
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: API làm mới token
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Làm mới token"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            token:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return user data & accessToken.
 *       401:
 *         description: Get credentials failed.
 */
router.post("/refresh", auth, async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const token: string = await generateAuthToken(user);
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON, token });
  } catch (e) {
    res.status(401).send({
      code: e.message,
    });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *      - "[App] auth"
 *     summary: Lấy thông tin tài khoản user
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user: any = req.user;
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

router.get("/meAdmin", authEmploye, async (req, res) => {
  try {
    const user: any = req.user;
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});


router.post("/checkphone", async (req: Request, res: Response) => {
  try {
    const phone = req.body.phone;
    const user = await findPhone(phone);
    res.json(user);
  } catch (e) {
    res.status(401).send({
      code: e.message,
    });
  }
});


/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: API đăng ký mới tài khoản user
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Thông tin tài khoản"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            username:
 *              type: "string"
 *            password:
 *              type: "string"
 *            email:
 *              type: "string"
 *            nickname:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return user data & accessToken.
 *       401:
 *         description: Create new use failed.
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const user: UserInterface = req.body;
    if (user.username == null || user.password == null || user.username == "" || user.password == "") throw new Error("Username or password invalid");
    const passwordHash = encryptPassword(user.password);
    user.password = passwordHash;
    const userSaved = await UserModel.create(user);
    await userSaved.reload();

    const token: string = await generateAuthToken(user);
    const userJSON: any = userSaved.toJSON();
    delete userJSON.password;
    sendSuccess(res, { user: userJSON, token });

  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});

router.post("/registerAdmin", async (req: Request, res: Response) => {
  try {
    const user: UserInterface = req.body;
    if (user.username == null || user.password == null || user.username == "" || user.password == "") throw new Error("Username or password invalid");
    const passwordHash = encryptPassword(user.password);
    user.password = passwordHash;
    const userSaved = await UserModel.create(user);
    await userSaved.reload();

    const token: string = await generateAuthToken(user);
    const userJSON: any = userSaved.toJSON();
    delete userJSON.password;
    await sendMail("lucvd@flextech.vn", "Xét duyệt nhân viên", `<p>Xét duyệt cho tài khoản có username là ${userJSON.username}</p>`);
    sendSuccess(res, { user: userJSON, token });

  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});


router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await findPhone(phone);
    if (user.status == true) {
      const newOtpCode = await forgotPassword(user.data.id);
      res.json({
        status: true,
        message: "Đã gửi mã OTP!"
      });
    } else {
      res.json({
        status: false,
        message: "User Not Found!"
      });
    }

  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }

});

router.post("/check-otp", async (req: Request, res: Response) => {
  try {
    const { phone, otpcode } = req.body;
    if (phone == null || phone == "" || otpcode == null || otpcode == "") {
      res.json({ status: false, message: "missing field list" });
    } else {
      const verifiedUser = await UserModel.findOne({
        where: {
          phone: phone,
          otpCode: otpcode
        }
      });
      if (verifiedUser !== null) {
        const token: string = await generateAuthToken(verifiedUser);
        const userJSON: any = verifiedUser.toJSON();
        delete userJSON.otpCode;
        delete userJSON.password;
        res.send({ status: true, user: userJSON, token });
      } else {
        res.json({ status: false, message: "OTP ERROR" });
      }
    }

  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }
});

router.post("/update-forgot-password", auth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userLogin: any = req.user;
    
    if (password == null || password == "") {
      res.json({ status: false, message: "missing field list" });
    } else {
      if(userLogin !== null) {
        userLogin.password = encryptPassword(password);
        await userLogin.save();
        delete userLogin.password;
        res.send({ status: true, user: userLogin});
      }else {
        res.json({ status: false, message: "Auth Error" });
      }

    }
  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }

});


router.put("/update-password", auth, async (req: Request, res: Response) => {
  try {
    const { oldPassword, password } = req.body;
    const userLogin: any = req.user;
    if (password == null || oldPassword == null || password == "" || oldPassword == "") {
      res.json({ status: false, message: "missing field list" });
    } else {
      const verifiedUser = await findCredentials(userLogin.phone, oldPassword);
      if (verifiedUser) {
        verifiedUser.password = encryptPassword(password);
        await verifiedUser.save();
        const userJSON: any = verifiedUser.toJSON();
        if (userJSON.password !== null) {
          userJSON.passwordStatus = "hasPassword";
        }
        delete userJSON.password;
        res.send({ status: true, user: userJSON });
      } else {
        res.json({ status: false, message: "wrong old password!" });
      }
    }

  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }
});

router.put("/me", auth, async (req, res) => {
  try {
    const user: any = req.user;
    const userDB: any = await UserModel.findByPk(user.id);

    await userDB.update(req.body);
    await userDB.reload();
    const userJSON: any = userDB.toJSON();
    if (userJSON.password) {
      userJSON.passwordStatus = "hasPassword";
    }
    delete userJSON.password;
    res.send({ user: userJSON });
  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }
});

export default router;