import { Request, Response, Router } from "express";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";
import FormData from "form-data";
import { Op } from "sequelize";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import axios from "axios";




const router = Router();

router.post("/upload/:id", upload.array("image"), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.json({
                status: false,
                message: "No file upload"
            });
        } else {

            const ticketItem = await LotteryTicketModel.findOne({
                where: {
                    id: req.params.id,
                    employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVING
                }
            });

            const orderItem = await LotteryOrdersModel.findAll({
                where: {
                    ticketId: req.params.id
                }
            });

            if (ticketItem !== null) {

                const files: any[] = [];
                const fileKeys = Object.keys(req.files);
                fileKeys.forEach(function (key) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    files.push(req.files[key]);
                });

                const images: any[] = [];


                await Promise.all(
                    files.map(async file => {

                        const data = new FormData();
                        data.append("file", file.buffer);

                        const postImg = await axios({
                            method: "post",
                            url: process.env.HOST_IMAGES_URL + "/images?category=content",
                            headers: {
                                ...data.getHeaders()
                            },
                            data: data
                        });

                        const dataResp = postImg.data;

                        const fileName = dataResp.data.url.src;
                        images.push({ url: fileName });

                        const objectData: any = {
                            imageslist: fileName,
                             LotteryTicketModelId: req.params.id
                         };
                         await LotteryImagesModel.create(objectData);

                         orderItem.forEach(async (element) => {
                             element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
                             await element.save();
                         });
                         ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
                         ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;

                         await ticketItem.save();
                    })
                );

                 ticketItem.employeStatus = LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVED;
                 await ticketItem.save();
                 await ticketItem.reload();

                return res.json({
                    status: true,
                    data: ticketItem
                });

            } else {
                res.send({
                    status: false,
                    message: "can\'t upload image with ID: " + req.params.id
                });
            }
        }

    } catch (e) {
        console.log(e.message);
        res.status(400).send({
            error: e.message
        });
    }
});

router.post("/error/:ticketId", async (req: Request, res: Response) => {
    try {
        if (typeof req.params.ticketId !== "undefined") {

            const Ticket = await LotteryTicketModel.findOne({
                where: {
                    id: req.params.ticketId,
                    employeStatus: LotteryTicketModel.EMPLOYESTATUS_ENUM.RECEIVING
                }
            });

            if (Ticket !== null) {

                Ticket.employeStatus = LotteryTicketModel.EMPLOYESTATUS_ENUM.NOT_RECEIVED;
                await Ticket.save();
                await Ticket.reload();

                res.json({
                    status: true,
                    message: "Success: Cập nhật thành công!"
                });

            } else {
                res.json({
                    status: false,
                    message: "ERROR: can't find Ticket!"
                });
            }

        } else {
            res.json({
                status: false,
                message: "ERROR: error params"
            });
        }
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
});

export default router;