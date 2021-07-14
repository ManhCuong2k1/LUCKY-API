import { Request, Response, Router } from "express";
import helper from "@controllers/api/helper/helper";
import Crawl from "../../crawl/Crawl";
import { LotteryInterface, LotteryModel } from "@models/Lottery";
import { LotteryOrdersInterface, LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketInterface, LotteryTicketModel } from "@models/LotteryTicket";
const router = Router();

router.get("/results/:type", async (req: Request, res: Response) => {
            try {
                if (typeof req.query.id !== "undefined") {
                    const resultsData = await LotteryModel.findOne({
                        where: {
                            id: req.query.id
                        }
                    });
                    res.json(resultsData);
                } else {
                    const resultsData = await LotteryModel.findAll({ 
                        where: { 
                            type: req.params.type 
                            }, order: [["id", "DESC"]]
                        });

                    const dataExport: any = [];
                    if(resultsData.length > 0) {
                        resultsData.forEach((resultsData: any) => {
                            const dataPush = {
                                id: resultsData.id,
                                type: resultsData.type,
                                date: resultsData.date,
                                next: resultsData.next,
                                round: resultsData.round,
                                result: JSON.parse(resultsData.result),
                                createdAt: resultsData.createdAt,
                                updatedAt: resultsData.updatedAt
                            };
                            dataExport.push(dataPush);
                        });
                        res.json(dataExport);
                    }else {
                        res.json({
                            status: false,
                            message: "Chưa có kết quả nào" 
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


router.get("/tickets", async (req: Request, res: Response) => {

            try {
                if (typeof req.query.id !== "undefined") {

                    const ticketsData = await LotteryTicketModel.findOne({
                        where: {
                            id: req.query.id
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
                    const ticketsData = await LotteryTicketModel.findAll({
                        order: [["id", "DESC"]]
                    });

                    console.log(ticketsData);

                    if (ticketsData != null) {

                        const dataExport: any = [];

                        ticketsData.forEach(async (ticket: any) => {


                            const ordersDone = await LotteryOrdersModel.findAll({
                                where: {
                                    ticketId: ticket.id,
                                    orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED
                                }
                            });

                            if (ticket.preriod == ordersDone.length) {

                                const checkIsWin = await LotteryOrdersModel.findAll({
                                    where: {
                                        ticketId: ticket.id,
                                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED,
                                        resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED
                                    }
                                });

                                ticket.orderStatus = LotteryTicketModel.TICKET_ENUM.DRAWNED;
                                ticket.resultDetail = (checkIsWin.length > 0) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                                await ticket.save();
                                await ticket.reload();

                                dataExport.push(ticket);

                            } else {
                                dataExport.push(ticket);
                            }

                        });

                        res.send(await LotteryTicketModel.findAll());

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


router.get("/ticketDetail/:type/:id", async (req: Request, res: Response) => {
    switch (req.params.type) {
        case "keno":
            try {
                if (typeof req.query.id !== "undefined") {
                    const ticketsData = await LotteryOrdersModel.findAll({
                        where: {
                            ticketId: req.query.id
                        }
                    });

                    res.json(ticketsData); 

                } else {
                    const ordersData = await LotteryOrdersModel.findAll();
                    res.json(ordersData);
                }
            }catch (error) {
                res.json({
                    status: false,
                    message: error
                });
            }
            break;

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
            }catch (error) {
                res.json({
                    status: false,
                    message: error
                });
            }
            break;

    }
});


export default router;