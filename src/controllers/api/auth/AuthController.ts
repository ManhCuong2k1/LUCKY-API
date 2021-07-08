import { ValidationError, ValidationErrorItem } from "sequelize";
import express, { Response, Request } from "express";
import { generateAuthToken, findCredentials, UserModel, findPhone } from "@models/User";
import { sendSuccess, sendError } from "@util/response";
import { auth } from "@middleware/auth";
import { TaskCompletionModel } from "@models/TaskCompletion";

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


 router.post("/checkphone", async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const phone = req.body.phone;
    const user = await findPhone(phone);
    res.json({ user });
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
    const params = req.parameters.permit(UserModel.CREATEABLE_PARAMETERS).value();
 
    let referrer;
    if (params.referrerCode) referrer = await UserModel.scope([{ method: ["byReferralCode", params.referrerCode] }]).findOne();
    if (referrer) params.referrerId = referrer.id;
    const user = await UserModel.create(params);
    if (referrer) TaskCompletionModel.completeReferTask(referrer);
    await user.reload();
    const token: string = await generateAuthToken(user);
    const userJSON: any = user.toJSON();
    delete userJSON.password;
    sendSuccess(res, { user: userJSON, token  });
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 422, error.errors.map((err: ValidationErrorItem) => err.message), error);
    }
    sendError(res, 400, error.message, error);
  }
});


router.post("/otp", async (req: Request, res: Response) => {


  res.send("sended otp code!");
});


export default router;
 