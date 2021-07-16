import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketInterface, LotteryTicketModel } from "@models/LotteryTicket";
import sequelize, { Sequelize } from "sequelize";
import { LotteryImagesInterface, LotteryImagesModel } from "@models/LotteryImages";

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
    
            const condition = (req.params.type == "win" && resultsDetail != "") ? "`LotteryTicketModel`.`userId`='"+ user.id +"' AND `LotteryTicketModel`.`orderStatus` = '"+ orderStatus +"' AND `LotteryTicketModel`.`resultDetail` = '"+ resultsDetail +"'" : (req.params.type == "drawned") ? "`LotteryTicketModel`.`userId`='"+ user.id +"' AND (`LotteryTicketModel`.`orderStatus` = '"+ orderStatus +"' OR `LotteryTicketModel`.`orderStatus` = 'canceled') AND `LotteryTicketModel`.`resultDetail` <> '"+LotteryTicketModel.RESULTSTATUS_ENUM.WINNED+"'" : "`LotteryTicketModel`.`userId`='"+ user.id +"' AND `LotteryTicketModel`.`orderStatus` = '"+ orderStatus +"'";
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

                res.send({
                    data: await LotteryTicketModel.findAll({
                        where: Sequelize.literal(condition),
                        order: [["id", "DESC"]]
                    })
                });

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
            
            const ticketImages = await LotteryImagesModel.findAll({
                where: {
                    ticketId: req.query.id
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
            dataExport["images"] = ticketImages;
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
            message: error
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