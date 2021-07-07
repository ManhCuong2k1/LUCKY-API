import { Request, Response, Router } from "express";

const router = Router();


router.get("/:game", async (req: Request, res: Response) => {

    let status = true;
    let message = "success";
    let dataOrder: any = {};
    const arrayListNumber: any = ["A", "B", "C", "D", "E", "F", "G", "H"];

    if(req.params.game == null || req.params.game == "" || !req.params.game) {
        status = false;
        dataOrder = null;
        message = "error params!";
    }else {
        switch (req.params.game) {
            case "keno":
                arrayListNumber.forEach((data: any) => {
                    dataOrder[data] = 10000;
                });

            break;

            default:
                status = false;
                dataOrder = null;
                message = "error params!";
            break;
        }
    }

    res.json({
        status,
        data: dataOrder,
        message
    });

});




export default router;