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
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: any = req.query.searchKey ? req.query.searchKey : null;
        let phone = null;

        if (searchKey) {
            phone = { [Op.like]: `%${searchKey}%` };
        }

        const where = Object.assign({},
            phone === null ? null : { phone },
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            include: [{
                model: UserModel,
                as: "user",
                where,
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
            distinct: true,
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

router.post("/:id/images", upload.array("file"), async (req: Request, res: Response) => {
    try {
        if (!req.files) throw new Error("No file to upload");
        
        const ticketItem = await LotteryTicketModel.findOne({ 
            where: { 
                id: req.params.id,
                [Op.or]: [
                    { orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY }, 
                    { orderStatus: LotteryTicketModel.TICKET_ENUM.PRINTED }
                ],
            } 
        });
        
        const orderItem = await LotteryOrdersModel.findAll({
            where: {
                ticketId: req.params.id
            }
        });
        
        let data: any = Object.values(req.files);
            
        if(ticketItem !== null) {     
            await data.forEach(async (element: any) => {
                const fileName = await saveFile(element);
                const objectData: any = {
                    imageslist: fileName,
                    LotteryTicketModelId: req.params.id
                };
                await LotteryImagesModel.create(objectData);
                orderItem.forEach( async (element) => {
                    element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
                    await element.save();
                });
                ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
                ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
                
                await ticketItem.save();
            });
            
            res.send({data: ticketItem});
        } else {
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

router.post("/banner", upload.array("file"), async (req: Request, res: Response) => {
    try {

        if (!req.files) throw new Error("No file to upload");
        const data = Object.values(req.files);
            
        await data.forEach(async (element: any) => {            
            const fileName = await saveFile(element);
            const objectData: any = {
                imageslist: fileName,
            };
            await LotteryImagesModel.create(objectData);
        });
        res.send({status: true});  
    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

router.put("/updateImage/:id", async (req: Request, res: Response) => {
    try {
        const idTicket = req.params.id;
        const idImage1 = req.body.imageId1;
        const idImage2 = req.body.imageId2;

        const ticketItem = await LotteryTicketModel.findOne({ 
            where: { 
                id: idTicket,
                [Op.or]: [
                    { orderStatus: LotteryTicketModel.TICKET_ENUM.DELAY }, 
                    { orderStatus: LotteryTicketModel.TICKET_ENUM.PRINTED }
                ],
            } 
        });

        const orderItem = await LotteryOrdersModel.findAll({
            where: {
                ticketId: idTicket
            }
        });

        const dataImage: any = await LotteryImagesModel.findAll({
            where: {
                [Op.or]: [
                    { id: idImage1 }, 
                    { id: idImage2 }
                ],
            }
        });

        orderItem.forEach( async (element) => {
            element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
            await element.save();
        });
        
        dataImage[0].LotteryTicketModelId = parseInt(idTicket);
        dataImage[1].LotteryTicketModelId = parseInt(idTicket);
        ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
        ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
        
        await ticketItem.save();
        
        await dataImage[0].save();
        await dataImage[1].save();
        res.send(dataImage);
    } catch (error) {
        res.send({
            status: false, 
            message: "can\'t upload image with ID: "+ req.params.id
        });   
    }
});

export default router;
