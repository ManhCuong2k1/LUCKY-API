import { Request, Response, Router } from "express";
import upload from "@middleware/upload";
import FormData from "form-data";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryImagesModel } from "@models/LotteryImages";
import axios from "axios";




const router = Router();

router.post("/upload/:id", upload.fields([{ name: "beforeimage", maxCount: 1 }, { name: "afterimage", maxCount: 1 }]), async (req: any, res: any, next) => {


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

                let beforeImageSrc, afterImageSrc;

                if (typeof req.files.beforeimage !== 'undefined') {
                    const img1 = new FormData();
                    img1.append("file", req.files.beforeimage[0].buffer);
                    const postImg1 = await axios({
                        method: "post",
                        url: process.env.HOST_IMAGES_URL + "/images?category=content",
                        headers: {
                            ...img1.getHeaders()
                        },
                        data: img1
                    });
                    const dataResp1 = postImg1.data;
                    beforeImageSrc = dataResp1.data.url.src;
                }

                if (typeof req.files.afterimage !== 'undefined') {
                    const img2 = new FormData();
                    img2.append("file", req.files.afterimage[0].buffer);
                    const postImg2 = await axios({
                        method: "post",
                        url: process.env.HOST_IMAGES_URL + "/images?category=content",
                        headers: {
                            ...img2.getHeaders()
                        },
                        data: img2
                    });
                    const dataResp2 = postImg2.data;
                    afterImageSrc = dataResp2.data.url.src;
                }

                const objectData: any = {
                    LotteryTicketModelId: req.params.id,
                    beforeImage: beforeImageSrc,
                    afterImage: afterImageSrc
                };
                await LotteryImagesModel.create(objectData);

                orderItem.forEach(async (element) => {
                    element.orderStatus = await LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED;
                    await element.save();
                });

                ticketItem.orderStatus = await LotteryTicketModel.TICKET_ENUM.PRINTED;
                ticketItem.resultDetail = await LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED;
                await ticketItem.save();

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