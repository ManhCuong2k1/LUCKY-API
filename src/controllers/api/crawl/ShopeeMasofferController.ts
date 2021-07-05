import express, { Response, Request } from "express";
import Masoffer from "./Masoffer";
const router = express.Router();


router.get("/", async (req: Request, res: Response) => {
    try {
        await Masoffer.shopee();
        return res.json({ status: true });
    } catch (e) {
        res.status(401).send({
            code: e.message
        });
    }
  });
  

export default router;