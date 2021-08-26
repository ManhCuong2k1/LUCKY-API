import { Router, Request, Response } from "express";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import { UserModel } from "@models/User";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryNumbersModel } from "@models/LotteryNumbers";
import { LotteryStoragesModel } from "@models/LotteryStorage";
import { GridInterface } from "@models/Transformers/Grid";
import { Op, Sequelize } from "sequelize";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Ho_Chi_Minh");
import { uploadFile } from "../../../middleware/file";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const readXlsxFile = require("read-excel-file/node");
import path from "path";
const router = Router();

// Lấy danh sách vé Vietlott

router.get("/vietlott", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const searchCardId: string = req.query.searchCardId ? req.query.searchCardId.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const custody: string = req.query.custody ? req.query.custody.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { name: { [Op.like]: `%${searchKey.trim()}%` } },
            searchCardId === null ? null : { identify: { [Op.like]: `%${searchCardId.trim()}%` } },
        );

        const whereOder: any = Object.assign({},
            custody === null ? null : custody === "big_win" ? { custody: {[Op.gt]: 0} } : "",
        );

        const { rows, count }: any = await LotteryTicketModel.findAndCountAll({
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
            attributes: {
                include: [
                  [
                    Sequelize.literal("(SELECT name from users where users.id = LotteryTicketModel.employeUserId)"),
                    "name",
                  ],
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
                as: "orders",
                where: whereOder
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
        const searchCardId: string = req.query.searchCardId ? req.query.searchCardId.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const custody: string = req.query.custody ? req.query.custody.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { name: { [Op.like]: `%${searchKey.trim()}%` } },
            searchCardId === null ? null : { identify: { [Op.like]: `%${searchCardId.trim()}%` } },
        );

        const whereOder: any = Object.assign({},
            custody === null ? null : custody === "big_win" ? { custody: {[Op.gt]: 0} } : "",
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            where: {
                ...where,
                [Op.or]: [
                    { type: LotteryTicketModel.GAME_ENUM.COMPUTE123 },
                    { type: LotteryTicketModel.GAME_ENUM.COMPUTE636 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO234 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO2 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO3 },
                    { type: LotteryTicketModel.GAME_ENUM.LOTO5 },
                ],

            },
            attributes: {
                include: [
                  [
                    Sequelize.literal("(SELECT name from users where users.id = LotteryTicketModel.employeUserId)"),
                    "name",
                  ],
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
                as: "orders",
                where: whereOder
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

// Lấy danh sách vé Kien thiet

router.get("/construction", async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const searchKey: string = req.query.searchKey ? req.query.searchKey.toString() : null;
        const searchCardId: string = req.query.searchCardId ? req.query.searchCardId.toString() : null;
        const type: string = req.query.type ? req.query.type.toString() : null;
        const orderStatus: string = req.query.orderStatus ? req.query.orderStatus.toString() : null;
        const custody: string = req.query.custody ? req.query.custody.toString() : null;
        const fromDate: any = req.query.fromDate || null;
        const toDate: any = req.query.toDate || null;


        const where: any = Object.assign({},
            type === null ? null : { type },
            orderStatus === null ? null : orderStatus === "drawned" ? { resultDetail: "ĐÃ XỔ VÉ" } : orderStatus === "winned" ? { resultDetail: "TRÚNG GIẢI" } : { orderStatus },
            fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate).startOf("day"), moment(toDate).endOf("day")] } } : null
        );
        const whereUser: any = Object.assign({},
            searchKey === null ? null : { name: { [Op.like]: `%${searchKey.trim()}%` } },
            searchCardId === null ? null : { identify: { [Op.like]: `%${searchCardId.trim()}%` } },
        );

        const whereOder: any = Object.assign({},
            custody === null ? null : custody === "big_win" ? { custody: {[Op.gt]: 0} } : "",
        );

        const { rows, count } = await LotteryTicketModel.findAndCountAll({
            where: {
                ...where,
                type: LotteryTicketModel.GAME_ENUM.KIENTHIET,

            },
            attributes: {
                include: [
                  [
                    Sequelize.literal("(SELECT name from users where users.id = LotteryTicketModel.employeUserId)"),
                    "name",
                  ],
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
                as: "orders",
                where: whereOder
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
            attributes: {
                include: [
                  [
                    Sequelize.literal("(SELECT name from users where users.id = LotteryTicketModel.employeUserId)"),
                    "name",
                  ],
                ],
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
                as: "orders",
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
        const employeId = req.body.employeId;
        
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
                LotteryTicketModelId: req.params.id,
            };
            await LotteryImagesModel.create(objectData);
            orderItem.forEach( async (element) => {
                element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
                await element.save();
            });
            ticketItem.employeUserId = employeId;
            ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
            ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
            ticketItem.employeStatus = await LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVED;
            
            await ticketItem.save();
            
            res.send({data: ticketItem});
        } else {
            res.send({
                status: false, 
                message: "can\'t upload image with ID: "+ req.params.id
            });    
        }
    } catch (e) {
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
        const employeId = req.body.employeId;

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
        ticketItem.employeUserId = employeId;
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

// Huy ve
router.post("/:id", async (req: Request, res: Response) => {
    try {
        const ticketId = req.params.id;
        const ticketDetail: any = await LotteryTicketModel.findOne({
            where: {
                id: ticketId,
            },
        });

        const user: any = await UserModel.findOne({
            where : {
                id: ticketDetail.userId,
            }
        });

        const orderItem = await LotteryOrdersModel.findAll({
            where: {
                ticketId: req.params.id
            },
        });
        const number: any =  user.totalCoin + ticketDetail.totalPrice;
        user.totalCoin = number;
        await user.save();
        

        orderItem.forEach( async (e) => {
            e.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.CANCELED;
            await e.save();
        });
        
        ticketDetail.orderStatus = LotteryTicketModel.TICKET_ENUM.CANCELED;
        ticketDetail.resultDetail = "Đã hủy";
        ticketDetail.save();
        
        res.send({ticketDetail, orderItem, user});
    } catch (error) {
        res.send({
            status: false, 
            message: "can\'t upload image with ID: "+ req.params.id
        });   
    }
});

// doc file excel ghi data vao db
router.post("/excel/upload", uploadFile.single("file"), async (req: Request, res: Response) => {
    try {
        if (req.file == undefined) {
          return res.status(400).send("Please upload an excel file!");
        }
        
        const fileFolder = path.join(__dirname, "../../../../public/uploads/" + req.file.filename);
        
        
        const excelFile: any = {
            name: req.file.filename,
            path: `/uploads/${req.file.filename}`,
        };
        
        await LotteryStoragesModel.create(excelFile);
    
        readXlsxFile(fileFolder).then(async (rows: any[]) => {
            rows.shift();
            
            const tutorials: any = [];
        
            rows.forEach((row) => {
                const tutorial = {
                number: row[0],
                total: row[1],
                code: row[2],
                status: LotteryNumbersModel.STATUS_ENUM.TRUE,
                date: req.body.date
                };
        
                tutorials.push(tutorial);
            });
    
            const response = await LotteryNumbersModel.bulkCreate(tutorials);
            res.send({response, file: req.file.filename});
        });
      } catch (error) {
        res.status(500).send({
          message: "Could not upload the file: " + req.file.originalname,
        });
      }
});

// update date vao trong db 
router.post("/date/upload", async (req: Request, res: Response) => {
    try {
        const data = await LotteryNumbersModel.findAll({
            where: {    
                createdAt: req.body.createAt    
            }
        });
        
        const dataExcel = await LotteryStoragesModel.findOne({
            where: {
                name: req.body.file
            }
        });
        dataExcel.date = req.body.date;
        await dataExcel.save();
        data.forEach( async (e) => {
            e.date = req.body.date;
            await e.save();
        });
        res.send(data);
        
      } catch (error) {
        res.status(500).send({
          message: "Could not upload the file: " + req.file.originalname,
        });
      }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const idTicket = req.params.id;

        const orderItem = await LotteryOrdersModel.findAll({
            where: {
                ticketId: idTicket,
                custody: {
                    [Op.gt]: 0
                }
            }
        });
        orderItem.forEach((e) => {
            e.custody = 0;
            e.save();
        });
        res.send(orderItem);
    } catch (error) {
        res.send({
            status: false, 
            message: "can\'t upload image with ID: "+ req.params.id
        });   
    }
});

export default router;
