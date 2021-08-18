import { Request, Response, Router } from "express";
import moment from "moment";
import helper from "@controllers/api/helper/helper";
import { LotteryNumbersModel, getNumbers, getOneNumber } from "@models/LotteryNumbers";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { LotteryOrdersModel } from "@models/LotteryOrder";
import { UserHistoryModel, UserHistoryAdd } from "@models/LotteryUserHistory";
import { UserModel } from "@models/User";

const router = Router();


router.get("/getnumbers", async (req: Request, res: Response) => {

    try {

        const currentTime = helper.getTime(helper.timeStamp());
        const isActiveOrder = (currentTime.getHours() >= 17) ? true : false;
        let currentDate;
        let timeQuery;
        let dateOrder;
        const loop = 5;
        const dataExport: any[] = [];

        if (isActiveOrder) {
            currentDate = moment().add(1, "d");
            dateOrder = moment().add(1, "d").format("DD-MM-YYYY");
            timeQuery = moment().add(1, "d").format("YYYY-MM-DD");
        } else {
            currentDate = moment();
            dateOrder = moment().format("DD-MM-YYYY");
            timeQuery = moment().format("YYYY-MM-DD");
        }

        for (let i = 1; i <= loop; i++) {
            if (i != 1) {
                dateOrder = moment(currentDate).add(1, "d").format("DD-MM-YYYY");
                timeQuery = moment(currentDate).add(1, "d").format("YYYY-MM-DD");
                currentDate = moment(currentDate).add(1, "d");
            }
            const getNumberAvailible = await getNumbers(timeQuery, "true");
            dataExport.push({
                date: dateOrder,
                list: getNumberAvailible
            });
        }

        res.json({
            status: true,
            data: dataExport,
            message: "Lấy danh sách các số thành công!"
        });

    } catch (err) {
        console.log(err.message);
        res.json({
            status: false,
            message: err.message
        });
    }

});


router.post("/orders", async (req: Request, res: Response) => {
    try {
        const user: any = req.user;
        const body = req.body;
        let status = true, message, dataImport: any = null;
        const orderDetail: any[] = [];
        const numberPrice = 5000;
        let isCreateTicket: boolean = false;
        let fee = 0;
        let totalPriceToClient = 0;
        let totalPrice = 0;


        const currentTime = helper.getTime(helper.timeStamp());
        const isActiveOrder = (currentTime.getHours() != 18) ? true : false;

        if (isActiveOrder) { // kiểm tra đơn hàng có thể order trong thời gian cho phép hay không

            let timeOrder: any = helper.timeStamp();

            if (currentTime.getHours() >= 19) {
                timeOrder = helper.addMinuteToTime(helper.timeConverter(timeOrder), 1440); // add 1 day
            } else {
                timeOrder = helper.timeConverter(timeOrder);
            }

            if (body.date && body.data) {
                if (Object.keys(body.data).length > 0) {

                    // tạm tính tiền
                    let priceOrder: number = 0;
                    body.data.forEach((number: any) => {
                        priceOrder = priceOrder + (numberPrice * number.total);
                    });

                    fee = (fee * priceOrder) / 100;
                    totalPriceToClient = priceOrder + fee;

                    if (user.totalCoin >= totalPriceToClient) {
                                // 2021-08-18
                        const dateQuery = moment(body.date).format("YYYY-MM-DD"); // 13-08-2021
                        const roundId = moment(body.date).format("YYYYMMDD"); // 20210813

                        for (const orders of body.data) {
                            const numberDB = await getOneNumber(orders.number, dateQuery, LotteryNumbersModel.STATUS_ENUM.TRUE);

                            if(numberDB != null) {
                                if (numberDB.total > 0) {
                                    isCreateTicket = true;
                                    let setTotalDB: number = 0; // set số lượng sẽ trừ đi vào db lúc order
                                    if (numberDB.total < orders.total) {
                                        setTotalDB = numberDB.total;
                                    } else if (numberDB.total >= orders.total) {
                                        setTotalDB = orders.total;
                                    }
                                    const priceOfThisNumb: number = numberPrice * setTotalDB;
                                    totalPrice = totalPrice + priceOfThisNumb;
                                    numberDB.total = numberDB.total - setTotalDB;
                                    await numberDB.save();
                                    await numberDB.reload();
                                    orderDetail.push({
                                        number: orders.number,
                                        total: setTotalDB,
                                        price: priceOfThisNumb
                                    });

                                } else {
                                    console.log("ĐÃ HẾT SỐ " + orders.number + " NÊN KHÔNG THỂ MUA...");
                                }                                
                            }else {
                                console.log("SỐ " + orders.number + " KHÔNG TỒN TẠI.");
                            }
                        }

                        if (isCreateTicket) {

                            const dataTicket: any = {
                                userId: user.id,
                                type: LotteryTicketModel.GAME_ENUM.KIENTHIET,
                                preriod: 1,
                                totalPrice: totalPrice,
                                orderDetail: "Mua Vé Số Kiến Thiết",
                                orderStatus: LotteryTicketModel.TICKET_ENUM.PRINTED,
                                resultDetail: LotteryTicketModel.RESULTSTATUS_ENUM.DRAWNED,
                                moreDetail: "Đại lý giữ hộ vé",
                                employeStatus: "received"
                            };
                            const creatTicket = await LotteryTicketModel.create(dataTicket);

                            dataImport = {
                                ticketId: creatTicket.id,
                                userId: user.id,
                                type: LotteryOrdersModel.GAME_ENUM.KIENTHIET,
                                roundId: roundId,
                                orderDetail: JSON.stringify({
                                    data: orderDetail,
                                    totalprice: totalPrice
                                }),
                                orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED,
                                resultStatus: LotteryOrdersModel.RESULTSTATUS_ENUM.DELAY + " " + helper.getDate(timeOrder) + " 18:15:0",
                                finishTime: helper.getDate(timeOrder) + " 18:15:0",
                                moreDetail: "Đại lý giữ hộ vé"
                            };
                            (dataImport !== null) ? await LotteryOrdersModel.create(dataImport) : "";

                            (dataImport !== null) ? await UserHistoryAdd(user.id, UserHistoryModel.ACTION_SLUG_ENUM.BUY_TICKET, UserHistoryModel.ACTION_NAME_ENUM.BUY_TICKET, "Mua vé số Kiến Thiết Hết " + helper.numberformat(totalPrice) + " VND") : "";


                            const UserData = await UserModel.findOne({ where: { id: user.id } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalCoin = UserData.totalCoin - totalPrice;
                            await UserData.save();
                            await UserData.reload();


                            status = true, message = "Mua Vé Thành Công!";

                        } else {
                            status = false, message = "Các số bạn chọn đã được người khác mua hết! Vui lòng quay trở lại màn hình chính của LuckyPlayLot và thực hiện lại!";
                        }


                    } else {
                        status = false, message = "Bạn không đủ tiền. Số tiền hiện tại không đủ " + helper.numberformat(totalPriceToClient) + " đ";
                    }

                } else {
                    status = false; message = "Vui lòng chọn ít nhất một số để mua vé!";
                }
            } else {
                status = false; message = "Vui lòng nhập đủ thông tin";
            }
        } else {
            status = false, message = "Không thể mua vé trong khoảng thời gian này! Vui lòng đọc hướng dẫn mua vé!";
        }

        res.json({ status, message });
    } catch (err) {
        console.log(err);
        res.json({
            status: false,
            message: err.message
        });
    }
});



export default router;