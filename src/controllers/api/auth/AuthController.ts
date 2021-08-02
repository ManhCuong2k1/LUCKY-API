import { ValidationError, ValidationErrorItem } from "sequelize";
import express, { Response, Request } from "express";
import { generateAuthToken, findCredentials, findCredentialAdmin, UserModel, findPhone, UserInterface, generateOtpCode, generateString, PostUserOtp, generateUsername } from "@models/User";
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
 *        description: "Tài khoản đăng nhập (tài khoản là số điện thoại)"
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


/**
 * @openapi
 * /auth/loginAdmin:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: API đăng nhập tài khoản ADMIN
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Tài khoản đăng nhập (tài khoản là tên người dùng)"
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
 *     security:
 *      - Bearer: []
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
 *     summary: Lấy thông tin tài khoản
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
    console.log(user);
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    res.send({ user: userJSON });
  } catch (e) {
    res.status(400).send({
      error: e.message,
    });
  }
});

/**
 * @openapi
 * /auth/meAdmin:
 *   get:
 *     tags:
 *      - "[App] auth"
 *     summary: Lấy thông tin tài khoản ADMIN
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 *     security:
 *      - Bearer: []
 */
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

/**
 * @openapi
 * /auth/checkphone:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: Kiểm tra tài khoản với số điện thoại có tồn tại không, nếu có thì trả lại thông tin tài khoản, còn không thì tự động taoj tài khoản với sđt này(mật khẩu ngẫu nhiên)
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Số điện thoại"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            phone:
 *              type: "string"
*     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */
router.post("/checkphone", async (req: Request, res: Response) => {
  try {
    const { phone }: any = req.body;
    const user: any = await findPhone(phone);
    if (user.status == false) {
      const userInterf: any = req.body;
      userInterf.username = await generateUsername(6);
      userInterf.password = generateString(8);
      userInterf.password = encryptPassword(userInterf.password);
      const userSaved = await UserModel.create(userInterf);
      const newOTP = await PostUserOtp(userSaved.id);
      await userSaved.reload();
      const token: string = await generateAuthToken(userSaved);
      const userJSON: any = userSaved.toJSON();
      delete userJSON.password;
      res.json({
        status: true,
        isnew: true,
        data: userJSON,
        token
      });

    } else {
      user.isnew = false;
      res.json(user);
    }
  } catch (e) {
    res.status(401).send({
      code: e.message,
    });
  }
});


/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: Gửi OTP đến số điện thoại có trong hệ thống
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Số điện thoại trên hệ thống"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            phone:
 *              type: "string"
*     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */

router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await findPhone(phone);
    if (user.status == true) {
      const newOtpCode = await PostUserOtp(user.data.id);
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

/**
 * @openapi
 * /auth/check-otp:
 *   post:
 *     tags:
 *      - "[App] auth"
 *     summary: Xác thực mã OTP
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Số điện thoại trên hệ thống và mã OTP đã nhận"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            phone:
 *              type: "string"
 *            otpcode:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */
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
        if (verifiedUser.status == UserModel.STATUS_ENUM.PENDING) {
          verifiedUser.status = UserModel.STATUS_ENUM.WORKING;
          await verifiedUser.save();
          await verifiedUser.reload();
        }
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

/**
 * @openapi
 * /auth/set-password:
 *   put:
 *     tags:
 *      - "[App] auth"
 *     summary: Đặt mật khẩu không cần mật khẩu cũ (dành cho quên mật khâủ và đăng kí)
 *     security:
 *      - Bearer: []
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Mật khẩu mới"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            phone:
 *              type: "string"
 *            otpcode:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */

router.put("/set-password", auth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userLogin: any = req.user;

    if (password == null || password == "") {
      res.json({ status: false, message: "missing field list" });
    } else {
      if (userLogin !== null) {
        userLogin.password = encryptPassword(password);
        await userLogin.save();
        await userLogin.reload();
        const token: string = await generateAuthToken(userLogin);
        const userJSON: any = userLogin.toJSON();
        delete userJSON.otpCode;
        delete userJSON.password;

        res.send({ status: true, user: userJSON, token });
      } else {
        res.json({ status: false, message: "Auth Error" });
      }

    }
  } catch (e) {
    res.status(400).send({ status: false, message: e.message });
  }

});

/**
 * @openapi
 * /auth/update-password:
 *   put:
 *     tags:
 *      - "[App] auth"
 *     summary: Đặt mật khẩu cần mật khẩu cũ (dành cho đổi mật khâủ)
 *     security:
 *      - Bearer: []
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Mật khẩu cũ và mật khâủ mới"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            oldpassword:
 *              type: "string"
 *            password:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */
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

/**
 * @openapi
 * /auth/me:
 *   put:
 *     tags:
 *      - "[App] auth"
 *     summary: Cập nhật thông tin người dùng
 *     security:
 *      - Bearer: []
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "thông tin cần cập nhật"
 *        require: fale
 *        schema:
 *          type: "object"
 *          properties:
 *            name:
 *              type: "string"
 *            nickname:
 *              type: "string"
 *            avatar:
 *              type: "string"
 *            gender:
 *              type: "string"
 *            identify:
 *              type: "string"
 *            dateOfbirth:
 *              type: "string"
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */
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