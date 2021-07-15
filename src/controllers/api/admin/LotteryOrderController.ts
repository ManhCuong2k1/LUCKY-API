import { Router, Request, Response } from "express";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesInterface,  LotteryImagesModel } from "@models/LotteryImages";
import { UserModel, UserInterface, } from "@models/User";
import { LotteryTicketInterface,  LotteryTicketModel } from "@models/LotteryTicket";
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
        const ticketAll = await LotteryTicketModel.findAll({
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
        res.send({ data: ticketAll });
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
        if (!req.file) throw new Error("No file to upload");

        const orderItem = await LotteryTicketModel.findOne({ 
            where: { 
                id: req.params.id,
                orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY
            } });

        if(orderItem !== null) {
            const data = req.file;
            const fileName = await saveFile(data);
            const dataConfig: any = {
                ticketId: parseInt(req.params.id),
                imageslist: fileName
            };
            const dataImages = await LotteryImagesModel.create(dataConfig);
            orderItem.orderStatus = LotteryTicketModel.TICKET_ENUM.PRINTED;
            orderItem.resultDetail = LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
            await orderItem.save();
            res.send({status: orderItem.orderStatus, dataImages});            
        }else {
            res.send({
                status: false, 
                message: "can\'t upload image with ID: "+ req.params.id
            });    
        }
    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;