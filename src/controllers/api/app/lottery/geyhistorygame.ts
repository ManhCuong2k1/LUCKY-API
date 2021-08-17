import { Request, Response, Router } from "express";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { Sequelize } from "sequelize";
import { LotteryImagesModel } from "@models/LotteryImages";
import { GridInterface } from "@models/Transformers/Grid";

const router = Router();

router.get("/tickets/:type", async (req: Request, res: Response) => {

    const user: any = req.user;
    try {
        if (typeof req.query.id !== "undefined") {

            const ticketsData = await LotteryTicketModel.findOne({
                where: {
                    id: req.query.id,
                    userId: user.id
                }, order: [["id", "DESC"]]
            });

            if (ticketsData != null) {
                const ordersDone = await LotteryOrdersModel.findAll({
                    where: {
                        ticketId: req.query.id,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED
                    }
                });

                if (ticketsData.preriod == ordersDone.length) {

                    const checkIsWin = await LotteryOrdersModel.findAll({
                        where: {
                            userId: user.id,
                            ticketId: req.query.id,
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED,
                            resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED
                        }
                    });

                    ticketsData.orderStatus = LotteryTicketModel.TICKET_ENUM.DRAWNED;
                    ticketsData.resultDetail = (checkIsWin.length > 0) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await ticketsData.save();
                    await ticketsData.reload();
                    res.json(ticketsData);
                } else {
                    res.json(ticketsData);
                }

            } else {
                res.json({
                    status: false,
                    message: "Cant not find ticket with ID: " + req.query.id
                });
            }

        } else {

            const orderStatus = (req.params.type == "win") ? LotteryTicketModel.TICKET_ENUM.DRAWNED : req.params.type;
            const resultsDetail = (req.params.type == "win") ? LotteryTicketModel.RESULTSTATUS_ENUM.WINNED : "";
            const condition = (req.params.type == "win" && resultsDetail != "") ? "`LotteryTicketModel`.`userId`='" + user.id + "' AND `LotteryTicketModel`.`orderStatus` = '" + orderStatus + "' AND `LotteryTicketModel`.`resultDetail` = '" + resultsDetail + "'" : (req.params.type == "drawned") ? "`LotteryTicketModel`.`userId`='" + user.id + "' AND (`LotteryTicketModel`.`orderStatus` = '" + orderStatus + "' OR `LotteryTicketModel`.`orderStatus` = 'canceled') AND `LotteryTicketModel`.`resultDetail` <> '" + LotteryTicketModel.RESULTSTATUS_ENUM.WINNED + "'" : "`LotteryTicketModel`.`userId`='" + user.id + "' AND `LotteryTicketModel`.`orderStatus` = '" + orderStatus + "'";

            const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
            const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "16");
            const cursor: number = (page - 1) * pageSize;

            const { rows, count } = await LotteryTicketModel.findAndCountAll({
                where: Sequelize.literal(condition),
                limit: pageSize,
                offset: cursor,
                order: [["id", "DESC"]],
            });
    
            const ticketsData = await LotteryTicketModel.findAll({
                where: Sequelize.literal(condition),
                order: [["id", "DESC"]]
            });

            if (ticketsData != null) {

                ticketsData.forEach(async (ticket: any) => {

                    const ordersDone = await LotteryOrdersModel.findAll({
                        where: {
                            userId: user.id,
                            ticketId: ticket.id,
                            orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED
                        }
                    });

                    if (ticket.preriod == ordersDone.length) {

                        const checkIsWin = await LotteryOrdersModel.findAll({
                            where: {
                                userId: user.id,
                                ticketId: ticket.id,
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED
                            }
                        });

                        ticket.orderStatus = LotteryTicketModel.TICKET_ENUM.DRAWNED;
                        ticket.resultDetail = (checkIsWin.length > 0) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                        await ticket.save();
                        await ticket.reload();
                    }

                });

                const responseData: GridInterface<LotteryTicketModel> = {
                    data: rows,
                    page: page,
                    pageSize: pageSize,
                    total: count
                };
                res.json(responseData);
        
            } else {
                res.json({
                    status: false,
                    message: "Bạn Chưa Có Giao Dịch Nào!"
                });
            }

        }
    } catch (error) {
        res.json({
            status: false,
            message: error
        });
    }
});


router.get("/ticketDetail", async (req: Request, res: Response) => {
    const user: any = req.user;
    try {
        if (typeof req.query.id !== "undefined") {

            const ticketData = await LotteryTicketModel.findOne({
                where: {
                    userId: user.id,
                    id: req.query.id
                }
            }); 

            const ticketImages = await LotteryImagesModel.findOne({
                where: {
                    LotteryTicketModelId: req.query.id
                },
                order: [["id", "ASC"]]
            });


            const ordersData = await LotteryOrdersModel.findAll({
                where: {
                    userId: user.id,
                    ticketId: req.query.id
                },
                order: [["id", "ASC"]]
            });

            const dataExport: any = {};
            dataExport["ticket"] = ticketData;

            if(ticketImages == null ) {
                const ticketImages: any = {};
                ticketImages.beforeImage = null;
                ticketImages.afterImage = null;
                dataExport["images"] = ticketImages;
            }else {
                ticketImages.beforeImage = (ticketImages.beforeImage !== null) ? process.env.HOST_IMAGES_EXPORT_URL + ticketImages.beforeImage : null;
                ticketImages.afterImage = (ticketImages.afterImage !== null) ? process.env.HOST_IMAGES_EXPORT_URL + ticketImages.afterImage : null;
    
                dataExport["images"] = ticketImages;                
            }

            dataExport["order"] = [];

            ordersData.forEach((order: any) => {

                const dataPush = {
                    id: order.id,
                    ticketId: order.ticketId,
                    userId: order.userId,
                    type: order.type,
                    roundId: order.roundId,
                    orderDetail: JSON.parse(order.orderDetail),
                    orderStatus: order.orderStatus,
                    resultDetail: JSON.parse(order.resultDetail),
                    resultStatus: order.resultStatus,
                    finishTime: order.finishTime,
                    moreDetail: order.moreDetail,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };

                dataExport["order"].push(dataPush);
            });

            res.json(dataExport);

        } else {
            res.json({
                status: false,
                message: "error ID of ticket!"
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error.message
        });
    }

});


router.get("/orders/:type", async (req: Request, res: Response) => {
    switch (req.params.type) {
        case "keno":
            try {
                if (typeof req.query.id !== "undefined") {
                    const ordersData = await LotteryOrdersModel.findOne({
                        where: {
                            id: req.query.id
                        }
                    });
                    res.json(ordersData);
                } else {
                    const ordersData = await LotteryOrdersModel.findAll();
                    res.json(ordersData);
                }
            } catch (error) {
                res.json({
                    status: false,
                    message: error
                });
            }
            break;

    }
});


export default router;