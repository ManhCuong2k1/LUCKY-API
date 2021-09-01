import { LotteryTicketModel } from "@models/LotteryTicket";
import helper from "@controllers/api/helper/helper";
import { LotteryResultsGetLastRound } from "@models/LotteryResults";

export const creatSignalCode = async (type: string, preriod: number, totalPrice: number, data: any) => {

    let TicketPrinter: any, run: number = 0;
    switch (type) {
        case LotteryTicketModel.GAME_ENUM.KENO:
            TicketPrinter = [];
            run = 0;

            TicketPrinter.push("keno");
            // chọn số kì
            TicketPrinter.push("d"); // chọn số lượng kì khác
            TicketPrinter.push(String(preriod)); // nhập vào số kì

            for (const order of data) {
                run++;
                order.toJSON();
                const orderDetails: any = order.orderDetail;

                for (const data of orderDetails.data) {
                    if (run > 1) break;
                    let stringNumber = helper.pushZeroToNumb(data.number);
                    stringNumber = data.number.join('');
                    stringNumber = stringNumber.split('');
                    for (const num of stringNumber) TicketPrinter.push(num);
                    TicketPrinter.push(data.price);
                    TicketPrinter.push("arrowdown");
                }
            };

            // ấn nút gửi
            TicketPrinter.push("send");
            // nếu số kì lớn hơn hoặc bằng 5
            if (preriod >= 5) TicketPrinter.push("1");
            // nếu số tiền lớn hơn hoặc bằng 100000
            if (totalPrice >= 100000) TicketPrinter.push("1");

            break;
        case LotteryTicketModel.GAME_ENUM.POWER:
            TicketPrinter = [];
            run = 0;

            for (const order of data) {
                order.toJSON();
                const orderDetails: any = order.orderDetail;

                TicketPrinter.push("6tren55");
                if (orderDetails.level != 6) {
                    TicketPrinter.push("baokhac");
                }


                for (const data of orderDetails.data) {
                    //if (run > 1) break;

                    if (orderDetails.level != 6) {
                        switch (orderDetails.level) {
                            case 5:
                                TicketPrinter.push("bao5");
                                break;
                            case 7:
                                TicketPrinter.push("bao7");
                                break;
                            case 8:
                                TicketPrinter.push("bao8");
                                break;
                            case 9:
                                TicketPrinter.push("bao9");
                                break;
                            case 10:
                                TicketPrinter.push("a");
                                break;
                            case 11:
                                TicketPrinter.push("b");
                                break;
                            case 12:
                                TicketPrinter.push("c");
                                break;
                            case 13:
                                TicketPrinter.push("d");
                                break;
                            case 14:
                                TicketPrinter.push("e");
                                break;
                            case 15:
                                TicketPrinter.push("f");
                                break;
                            case 15:
                                TicketPrinter.push("1");
                                break;
                        }
                    }

                    let stringNumber = helper.pushZeroToNumb(data.number);
                    stringNumber = data.number.join('');
                    stringNumber = stringNumber.split('');
                    for (const num of stringNumber) TicketPrinter.push(num);
                    TicketPrinter.push("arrowdown");

                }

                const lastRound = await LotteryResultsGetLastRound(LotteryTicketModel.GAME_ENUM.POWER);
                const numberChoose = Number(order.roundId) - Number(lastRound.round);

                TicketPrinter.push(helper.getCharFromNumBer(numberChoose - 1));
                TicketPrinter.push("send");

            };

            break;
        case LotteryTicketModel.GAME_ENUM.MEGA:
            TicketPrinter = [];
            run = 0;
            
            for (const order of data) {
                order.toJSON();
                const orderDetails: any = order.orderDetail;

                TicketPrinter.push("6tren45");
                if (orderDetails.level != 6) {
                    TicketPrinter.push("baokhac");
                }


                for (const data of orderDetails.data) {
                    //if (run > 1) break;

                    if (orderDetails.level != 6) {
                        switch (orderDetails.level) {
                            case 5:
                                TicketPrinter.push("bao5");
                                break;
                            case 7:
                                TicketPrinter.push("bao7");
                                break;
                            case 8:
                                TicketPrinter.push("bao8");
                                break;
                            case 9:
                                TicketPrinter.push("bao9");
                                break;
                            case 10:
                                TicketPrinter.push("a");
                                break;
                            case 11:
                                TicketPrinter.push("b");
                                break;
                            case 12:
                                TicketPrinter.push("c");
                                break;
                            case 13:
                                TicketPrinter.push("d");
                                break;
                            case 14:
                                TicketPrinter.push("e");
                                break;
                            case 15:
                                TicketPrinter.push("f");
                                break;
                            case 15:
                                TicketPrinter.push("1");
                                break;
                        }
                    }

                    let stringNumber = helper.pushZeroToNumb(data.number);
                    stringNumber = data.number.join('');
                    stringNumber = stringNumber.split('');
                    for (const num of stringNumber) TicketPrinter.push(num);
                    TicketPrinter.push("arrowdown");

                }

                const lastRound = await LotteryResultsGetLastRound(LotteryTicketModel.GAME_ENUM.MEGA);
                const numberChoose = Number(order.roundId) - Number(lastRound.round);

                TicketPrinter.push(helper.getCharFromNumBer(numberChoose - 1));
                TicketPrinter.push("send");

            };

    
            break;
        case LotteryTicketModel.GAME_ENUM.MAX3D:
            TicketPrinter = [];
            run = 0;
            TicketPrinter.push("3d");
            break;
        case LotteryTicketModel.GAME_ENUM.MAX3DPLUS:
            TicketPrinter = [];
            run = 0;
            TicketPrinter.push("3dplus");
            break;
        case LotteryTicketModel.GAME_ENUM.MAX4D:
            TicketPrinter = [];
            run = 0;
            TicketPrinter.push("4d");
            break;
    }

    return helper.employeStringToSignalCode(TicketPrinter);

};