import { Router, Request, Response } from "express";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { GridInterface } from "@models/Transformers/Grid";
import { Op } from "sequelize";
import moment from "moment-timezone";
import { type } from "os";
const router = Router();

// Lấy danh sách vé Vietlott

router.get("/vietlott", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day").subtract(8, "hours"), moment(toDate).endOf("day").subtract(8, "hours")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { phone: { [Op.like]: `%${searchKey.trim()}%` } },
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            where: {
                ...where,
                [Op.or]: [
                    { type: LotteryTicketModel.GAME_ENUM.KENO }, 
                    { type: LotteryTicketModel.GAME_ENUM.POWER },
                    { type: LotteryTicketModel.GAME_ENUM.MEGA }, 
                    { type: LotteryTicketModel.GAME_ENUM.MAX3D }, 
                    { type: LotteryTicketModel.GAME_ENUM.MAX3DPLUS },
                    { type: LotteryTicketModel.GAME_ENUM.MAX4D },
                ],

            },
            include: [{
                model: UserModel,
                as: "user",
                where: whereUser,
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

// Lấy danh sách vé Dien toan

router.get("/computer", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day").subtract(8, "hours"), moment(toDate).endOf("day").subtract(8, "hours")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { phone: { [Op.like]: `%${searchKey.trim()}%` } },
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            where: {
                ...where,
                [Op.or]: [
                    { type: LotteryTicketModel.GAME_ENUM.COMPUTE123 },
                    { type: LotteryTicketModel.GAME_ENUM.COMPUTE636 },
                    { type: LotteryTicketModel.GAME_ENUM.THANTAI4 },
                ],

            },
            include: [{
                model: UserModel,
                as: "user",
                where: whereUser,
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

// Lấy danh sách vé Loto

router.get("/loto", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day").subtract(8, "hours"), moment(toDate).endOf("day").subtract(8, "hours")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { phone: { [Op.like]: `%${searchKey.trim()}%` } },
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            where: {
                ...where,
                [Op.or]: [
                    { type: LotteryTicketModel.GAME_ENUM.LOTO234 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO2 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO3 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO5 },
                ],

            },
            include: [{
                model: UserModel,
                as: "user",
                where: whereUser,
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

// Lấy vé theo id

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

// post ảnh theo id vé

router.post("/:id/images", async (req: Request, res: Response) => {
    try {

        const imageBefore = req.body.imageBefore;
        const imageAfter = req.body.imageAfter;
        
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
            
        if(ticketItem !== null) {     
            const objectData: any = {
                beforeImage: imageBefore,
                afterImage: imageAfter,
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

// update images
router.put("/updateImage/:id", async (req: Request, res: Response) => {
    try {
        const idTicket = req.params.id;
        const imageBefore = req.body.imageBefore;
        const imageAfter = req.body.imageAfter;

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

        const dataImage: any = await LotteryImagesModel.findOne({
            where: {
                LotteryTicketModelId: idTicket
            }
        });

        orderItem.forEach( async (element) => {
            element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
            await element.save();
        });
        
        dataImage.beforeImage = imageBefore;
        dataImage.afterImage = imageAfter;
        ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
        ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
        
        await ticketItem.save();
        
        await dataImage.save();
        res.send(dataImage);
    } catch (error) {
        res.send({
            status: false, 
            message: "can\'t upload image with ID: "+ req.params.id
        });   
    }
});

router.post("/:id", async (req: Request, res: Response) => {
    try {
        const ticketId = req.params.id;
        const ticketDetail = await LotteryTicketModel.findOne({
            where: {
                id: ticketId,
            },
        });

        const orderItem = await LotteryOrdersModel.findAll({
            where: {
                ticketId: req.params.id
            }
        });

        orderItem.forEach( async (e) => {
            e.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.CANCELED;
            await e.save();
        });
        
        ticketDetail.orderStatus = LotteryTicketModel.TICKET_ENUM.CANCELED;
        ticketDetail.resultDetail = "Đã hủy";
        ticketDetail.save();
        
        res.send({ticketDetail, orderItem});
    } catch (error) {
        res.send({
            status: false, 
            message: "can\'t upload image with ID: "+ req.params.id
        });   
    }
});

export default router;
