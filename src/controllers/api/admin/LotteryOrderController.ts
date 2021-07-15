import { Router, Request, Response } from "express";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { GridInterface } from "@models/Transformers/Grid";
import { Op } from "sequelize";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";
const router = Router();

const getdata = async (typeGame: any) => {
    const data = await LotteryOrdersModel.findAll({
        where: {
            type: typeGame
        }
    });
    
    return data;
};

router.get("/", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "1");
        const cursor: number = (page - 1) * pageSize;
        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            include: [{
                model: UserModel,
                as: "user",
            },
            {
                model: LotteryImagesModel,
                as : "image"
            },
            {
                model: LotteryOrdersModel,
                as: "orders"
            }
            ],
            limit: pageSize,
            offset: cursor,
            order: [
                ["createdAt", "DESC"],
            ],
        });
        const responseData: GridInterface<LotteryTicketModel> = {
            data: rows,
            page: page,
            pageSize: pageSize,
            total: count
        };
        res.send(responseData );
    } catch (e) {
        res.status(400).send({
        error: e.message,
        });
    }
});

router.get("/detail/:id", async (req: Request, res: Response) => {
    try {
        const idTicket = req.params.id;
        const ticketDetail = await LotteryTicketModel.findOne({
            where: {
                id: idTicket
            },
            include: [{
                model: UserModel,
                as: "user",
            },
            {
                model: LotteryImagesModel,
                as : "image"
            },
            {
                model: LotteryOrdersModel,
                as: "orders"
            }
            ],
        });
        res.json({data: ticketDetail});
    } catch (e) {
        res.status(400).send({
        error: e.message,
        });
    }
});

router.get("/:type", async (req: Request, res: Response) => {
    try {
        const typeGame = req.params.type;
        let listGameType: any = [];
        
        switch(typeGame) {
            case "keno":
                listGameType = await getdata(typeGame);
                break;
            case "power":
                listGameType = await getdata(typeGame);
                break;
            case "mega":
                listGameType = await getdata(typeGame);
                break;
            case "plus3d":
                listGameType = await getdata(typeGame);
                break;
            case "3d":
                listGameType = await getdata(typeGame);
                break;
            case "4d":
                listGameType = await getdata(typeGame);
                break;
            default:
                res.json({
                    status: false,
                    message: "error"
                });
        }
        res.send({ data: listGameType });
    } catch (e) {
        res.status(400).send({
            error: e.message,
        });
    }
});

router.post("/:id/images", upload.single("image"), async (req: Request, res: Response) => {
    try {

        const id = req.params.id;
        
        const orderItem = await LotteryTicketModel.findByPk(id);
        if (!req.file) throw new Error("No file to upload");
        
        const data = req.file;
        
        const fileName = await saveFile(data);
        const dataConfig: any = {
            ticketId: parseInt(id),
            imageslist: fileName
        };
        const dataImages = await LotteryImagesModel.create(dataConfig);
        orderItem.orderStatus = LotteryTicketModel.TICKET_ENUM.PRINTED;
        await orderItem.save();
        res.send({status: orderItem.orderStatus, dataImages});
    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;
