import { LotteryOrdersModel } from "@models/LotteryOrder";
import { LotteryTicketModel } from "@models/LotteryTicket";
import { UserModel } from "@models/User";
import LotteryHelper from "./helper";
import { UserHistoryModel } from "@models/LotteryUserHistory";

const updateResult = async (game: string, data: any) => {

    let status: boolean = true, message: any, dataUpdate: any = null, dataUpdateChanLe: any = null;

    switch (game) {
        case "keno":
            try {
                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);

                    switch (orderDetail.childgame) {

                        // ĐẶT SỐ TRUYỀN THỐNG KENO
                        case "basic":
                            dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                            let isWin: boolean = false, updateReward: number = 0;

                            for (const i of orderDetail.data) {

                                const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                                const arrResult = LotteryHelper.arrayStringToNumber(data.result.pop());

                                const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                                let reward = LotteryHelper.getRewardKeno(arrBet.length, checkSame.length);
                                reward = reward * (i.price / 10000);

                                dataUpdate["data"].push({
                                    number: checkSame,
                                    reward: reward
                                });

                                if (reward > 0) {
                                    isWin = true;
                                    updateReward = updateReward + reward;

                                    const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                    if (!ticketData) throw new Error("Not found Ticket");
                                    ticketData.totalreward = ticketData.totalreward + updateReward;
                                    await ticketData.save();
                                    await ticketData.reload();

                                    const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                    if (!UserData) throw new Error("Not found user");
                                    UserData.totalReward = UserData.totalReward + updateReward;
                                    await UserData.save();
                                    await UserData.reload();
                                }

                            }

                            dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                            const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                            orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                            orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                            orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                            await orderUpdate.save();
                            await orderUpdate.reload();
                            break;


                        // CHẴN LẺ KENO
                        case "chanle_lonnho":

                            dataUpdateChanLe = {}, dataUpdateChanLe.data = [], dataUpdateChanLe.result = {};
                            let isWinChanLe: boolean = false;
                            let updateRewardChanLe: number = 0;

                            const chan = data.total.chan, le = data.total.le, lon = data.total.lon, nho = data.total.nho;

                            for (const i of orderDetail.data) {


                                let reward: number = 0;

                                if (data.total) {

                                    switch (i.select) {

                                        case "chanle_chansm":
                                            reward = (chan == 11 || chan == 12) ? 20000 : 0;
                                            break;

                                        case "chanle_lesm":
                                            reward = (le == 11 || le == 12) ? 20000 : 0;
                                            break;

                                        case "chanle_chanlg":
                                            reward = (chan == 13 || chan == 14) ? 40000 : (chan >= 15) ? 200000 : 0;
                                            break;

                                        case "chanle_lelg":
                                            reward = (le == 13 || le == 14) ? 40000 : (le >= 15) ? 200000 : 0;
                                            break;

                                        case "chanle_hoa":
                                            reward = (chan == 10 || le == 10) ? 20000 : 0;
                                            break;

                                        case "lonnho_nho":
                                            reward = (nho == 11 || nho == 12) ? 10000 : (nho >= 13) ? 26000 : 0;
                                            break;

                                        case "lonnho_hoa":
                                            reward = (nho == 10 || lon == 10) ? 26000 : 0;
                                            break;

                                        case "lonnho_lon":
                                            reward = (lon == 11 && lon == 12) ? 10000 : (lon >= 13) ? 26000 : 0;
                                            break;

                                    }

                                    reward = reward * (i.price / 10000);

                                    dataUpdateChanLe["data"].push({
                                        select: (reward > 0) ? i.select : "",
                                        reward: reward
                                    });

                                    if (reward > 0) {
                                        isWinChanLe = true;
                                        updateRewardChanLe = updateRewardChanLe + reward;


                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + reward;

                                        console.log(UserData.totalReward + " VND");

                                        await UserData.save();
                                        await UserData.reload();
                                    }

                                }

                            }

                            dataUpdateChanLe.result.iswin = isWinChanLe, dataUpdateChanLe.result.totalreward = updateRewardChanLe;

                            const orderUpdateChanle = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                            orderUpdateChanle.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                            orderUpdateChanle.resultDetail = JSON.stringify(dataUpdateChanLe);
                            orderUpdateChanle.resultStatus = (isWinChanLe) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                            await orderUpdateChanle.save();
                            await orderUpdateChanle.reload();

                            break;
                    }
                });

            } catch (error) {
                status = false, message = error;
            }

            break;

        case "power":
            try {

                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });



                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for (const i of orderDetail.data) {

                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                        const arrResult = LotteryHelper.arrayStringToNumber(data.result);

                        const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                        let reward = LotteryHelper.getRewardPower(arrBet.length, checkSame.length);
                        reward = reward * (i.price / 10000);

                        dataUpdate["data"].push({
                            number: checkSame,
                            reward: reward
                        });

                        if (reward > 0) {
                            isWin = true;
                            updateReward = updateReward + reward;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }
                    };

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                });

            } catch (error) {
                status = false, message = error;
            }
            break;

        case "mega":
            try {

                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });



                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {}, dataUpdate.data = [], dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for (const i of orderDetail.data) {

                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);
                        const arrResult = LotteryHelper.arrayStringToNumber(data.result);

                        const checkSame = LotteryHelper.checkSame(arrBet, arrResult);

                        let reward = LotteryHelper.getRewardMega(arrBet.length, checkSame.length);
                        reward = reward * (i.price / 10000);

                        dataUpdate["data"].push({
                            number: checkSame,
                            reward: reward
                        });

                        if (reward > 0) {
                            isWin = true;
                            updateReward = updateReward + reward;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }
                    };

                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                });

            } catch (error) {
                status = false, message = error;
            }
            break;

        case "max3d":
            try {

                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaikhuyenkhich = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;


                    for (const i of orderDetail.data) {


                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);


                        // GIAI NHAT
                        const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);
                        const rewardReciveGiaiNhat = checkSameGiaiNhat.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiNhat = rewardReciveGiaiNhat;
                        rewardGiaiNhat = rewardGiaiNhat * (i.price / 10000);

                        dataUpdate["data"]["giainhat"].push({
                            number: checkSameGiaiNhat,
                            reward: rewardGiaiNhat
                        });

                        if (rewardGiaiNhat > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhat;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }


                        // GIAI NHI
                        const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhi);
                        const checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);
                        const rewardReciveGiaiNhi = checkSameGiaiNhi.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiNhi = rewardReciveGiaiNhi;
                        rewardGiaiNhi = rewardGiaiNhi * (i.price / 10000);

                        dataUpdate["data"]["giainhi"].push({
                            number: checkSameGiaiNhi,
                            reward: rewardGiaiNhi
                        });

                        if (rewardGiaiNhi > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhi;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }

                        // GIAI BA 
                        const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giaiba);
                        const checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);
                        const rewardReciveGiaiBa = checkSameGiaiBa.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiBa = rewardReciveGiaiBa;
                        rewardGiaiBa = rewardGiaiBa * (i.price / 10000);

                        dataUpdate["data"]["giaiba"].push({
                            number: checkSameGiaiBa,
                            reward: rewardGiaiBa
                        });

                        if (rewardGiaiBa > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiBa;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }


                        // GIAI KHUYEN KHICH
                        const arrResultGiaiKhuyenKhich = LotteryHelper.arrayStringToNumber(data.result.giaikhuyenkhich);
                        const checkSameGiaiKhuyenKhich = LotteryHelper.checkSame(arrBet, arrResultGiaiKhuyenKhich);
                        const rewardReciveGiaiKhuyenKhich = checkSameGiaiKhuyenKhich.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiKhuyenKhich = rewardReciveGiaiKhuyenKhich;
                        rewardGiaiKhuyenKhich = rewardGiaiKhuyenKhich * (i.price / 10000);

                        dataUpdate["data"]["giaikhuyenkhich"].push({
                            number: checkSameGiaiKhuyenKhich,
                            reward: rewardGiaiKhuyenKhich
                        });

                        if (rewardGiaiKhuyenKhich > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiKhuyenKhich;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }

                    };

                    console.log(dataUpdate);


                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                });

            } catch (error) {
                status = false, message = error;
            }
            break;


        case "max3dplus":
            try {

                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaikhuyenkhich = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;


                    for (const i of orderDetail.data) {


                        const arrBet = LotteryHelper.arrayStringToNumber(i.number);


                        // GIAI NHAT
                        const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                        const checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);
                        const rewardReciveGiaiNhat = checkSameGiaiNhat.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiNhat = rewardReciveGiaiNhat;
                        rewardGiaiNhat = rewardGiaiNhat * (i.price / 10000);

                        dataUpdate["data"]["giainhat"].push({
                            number: checkSameGiaiNhat,
                            reward: rewardGiaiNhat
                        });

                        if (rewardGiaiNhat > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhat;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }


                        // GIAI NHI
                        const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhi);
                        const checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);
                        const rewardReciveGiaiNhi = checkSameGiaiNhi.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiNhi = rewardReciveGiaiNhi;
                        rewardGiaiNhi = rewardGiaiNhi * (i.price / 10000);

                        dataUpdate["data"]["giainhi"].push({
                            number: checkSameGiaiNhi,
                            reward: rewardGiaiNhi
                        });

                        if (rewardGiaiNhi > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiNhi;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }

                        // GIAI BA 
                        const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giaiba);
                        const checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);
                        const rewardReciveGiaiBa = checkSameGiaiBa.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiBa = rewardReciveGiaiBa;
                        rewardGiaiBa = rewardGiaiBa * (i.price / 10000);

                        dataUpdate["data"]["giaiba"].push({
                            number: checkSameGiaiBa,
                            reward: rewardGiaiBa
                        });

                        if (rewardGiaiBa > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiBa;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }


                        // GIAI KHUYEN KHICH
                        const arrResultGiaiKhuyenKhich = LotteryHelper.arrayStringToNumber(data.result.giaikhuyenkhich);
                        const checkSameGiaiKhuyenKhich = LotteryHelper.checkSame(arrBet, arrResultGiaiKhuyenKhich);
                        const rewardReciveGiaiKhuyenKhich = checkSameGiaiKhuyenKhich.length * 1000000; // các số trùng x 1.000.000
                        let rewardGiaiKhuyenKhich = rewardReciveGiaiKhuyenKhich;
                        rewardGiaiKhuyenKhich = rewardGiaiKhuyenKhich * (i.price / 10000);

                        dataUpdate["data"]["giaikhuyenkhich"].push({
                            number: checkSameGiaiKhuyenKhich,
                            reward: rewardGiaiKhuyenKhich
                        });

                        if (rewardGiaiKhuyenKhich > 0) {
                            isWin = true;
                            updateReward = updateReward + rewardGiaiKhuyenKhich;

                            const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                            if (!ticketData) throw new Error("Not found Ticket");
                            ticketData.totalreward = ticketData.totalreward + updateReward;
                            await ticketData.save();
                            await ticketData.reload();

                            const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                            if (!UserData) throw new Error("Not found user");
                            UserData.totalReward = UserData.totalReward + updateReward;
                            await UserData.save();
                            await UserData.reload();
                        }

                    };


                    dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                    const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                    orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                    orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                    orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                    await orderUpdate.save();
                    await orderUpdate.reload();

                });

            } catch (error) {
                status = false, message = error;
            }
            break;


        case "max4d":
            try {

                const OrderItem = await LotteryOrdersModel.findAll({
                    where: {
                        type: game,
                        roundId: data.round,
                        orderStatus: LotteryOrdersModel.ORDERSTATUS_ENUM.PRINTED
                    }
                });

                OrderItem.forEach(async (orderData: any) => {
                    const orderDetail = JSON.parse(orderData.orderDetail);
                    dataUpdate = {},
                        dataUpdate.data = {},
                        dataUpdate.data.giainhat = [],
                        dataUpdate.data.giainhi = [],
                        dataUpdate.data.giaiba = [],
                        dataUpdate.data.giaikhuyenkhich1 = [],
                        dataUpdate.data.giaikhuyenkhich2 = [],
                        dataUpdate.result = {};
                    let isWin: boolean = false, updateReward: number = 0;

                    for (const i of orderDetail.data) {
                        switch (orderDetail.childgame) {

                            // ĐẶT SỐ TRUYỀN THỐNG MAX4D
                            case "basic":

                                const arrBet = LotteryHelper.arrayStringToNumber(i.number);

                                // GIAI NHAT
                                const arrResultGiaiNhat = LotteryHelper.arrayStringToNumber(data.result.giainhat);
                                const checkSameGiaiNhat = LotteryHelper.checkSame(arrBet, arrResultGiaiNhat);

                                if (checkSameGiaiNhat.length > 0) {
                                    const rewardGiaiNhat = i.price * 1500; // lấy giá trị đặt cược x 1.500
                                    console.log("giai nhat " + rewardGiaiNhat);
                                    dataUpdate["data"]["giainhat"].push({
                                        number: checkSameGiaiNhat,
                                        reward: rewardGiaiNhat
                                    });

                                    if (rewardGiaiNhat > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiNhat;

                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }
                                }


                                // GIAI NHI
                                const arrResultGiaiNhi = LotteryHelper.arrayStringToNumber(data.result.giainhi);
                                const checkSameGiaiNhi = LotteryHelper.checkSame(arrBet, arrResultGiaiNhi);

                                if (checkSameGiaiNhi.length > 0) {

                                    const rewardGiaiNhi = i.price * 650; // lấy giá trị đặt cược x 650

                                    dataUpdate["data"]["giainhi"].push({
                                        number: checkSameGiaiNhi,
                                        reward: rewardGiaiNhi
                                    });

                                    if (rewardGiaiNhi > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiNhi;

                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }
                                }


                                // GIAI BA
                                const arrResultGiaiBa = LotteryHelper.arrayStringToNumber(data.result.giaiba);
                                const checkSameGiaiBa = LotteryHelper.checkSame(arrBet, arrResultGiaiBa);

                                if (checkSameGiaiBa.length > 0) {

                                    const rewardGiaiBa = i.price * 300; // lấy giá trị đặt cược x 300

                                    dataUpdate["data"]["giaiba"].push({
                                        number: checkSameGiaiBa,
                                        reward: rewardGiaiBa
                                    });

                                    if (rewardGiaiBa > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardGiaiBa;

                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }
                                }


                                // GIAI KHYEN KHICH 1
                                const arrResultKK1 = LotteryHelper.arrayStringToNumber(LotteryHelper.removeFirstChar(data.result.giaikhuyenkhich1, 1));
                                const checkSameKK1 = LotteryHelper.arrayStringToNumber(LotteryHelper.checkSame(LotteryHelper.removeFirstChar(LotteryHelper.arrNumberToString(arrBet), 1), arrResultKK1));

                                if (checkSameKK1.length > 0) {

                                    const rewardKK1 = i.price * 100; // lấy giá trị đặt cược x 100

                                    dataUpdate["data"]["giaikhuyenkhich1"].push({
                                        number: checkSameKK1,
                                        reward: rewardKK1
                                    });

                                    if (rewardKK1 > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardKK1;

                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }
                                }

                                // GIAI KHYEN KHICH 2
                                const arrResultKK2 = LotteryHelper.arrayStringToNumber(LotteryHelper.removeFirstChar(data.result.giaikhuyenkhich2, 2));
                                const checkSameKK2 = LotteryHelper.arrayStringToNumber(LotteryHelper.checkSame(LotteryHelper.removeFirstChar(LotteryHelper.arrNumberToString(arrBet), 2), arrResultKK2));

                                if (checkSameKK2.length > 0) {

                                    const rewardKK2 = i.price * 10; // lấy giá trị đặt cược x 10

                                    dataUpdate["data"]["giaikhuyenkhich2"].push({
                                        number: checkSameKK2,
                                        reward: rewardKK2
                                    });

                                    if (rewardKK2 > 0) {
                                        isWin = true;
                                        updateReward = updateReward + rewardKK2;

                                        const ticketData = await LotteryTicketModel.findByPk(orderData.ticketId);
                                        if (!ticketData) throw new Error("Not found Ticket");
                                        ticketData.totalreward = ticketData.totalreward + updateReward;
                                        await ticketData.save();
                                        await ticketData.reload();

                                        const UserData = await UserModel.findOne({ where: { id: orderData.userId } });
                                        if (!UserData) throw new Error("Not found user");
                                        UserData.totalReward = UserData.totalReward + updateReward;
                                        await UserData.save();
                                        await UserData.reload();
                                    }
                                }

                                dataUpdate.result.iswin = isWin, dataUpdate.result.totalreward = updateReward;

                                const orderUpdate = await LotteryOrdersModel.findOne({ where: { id: orderData.id } });
                                orderUpdate.orderStatus = LotteryOrdersModel.ORDERSTATUS_ENUM.DRAWNED;
                                orderUpdate.resultDetail = JSON.stringify(dataUpdate);
                                orderUpdate.resultStatus = (isWin) ? LotteryOrdersModel.RESULTSTATUS_ENUM.WINNED : LotteryOrdersModel.RESULTSTATUS_ENUM.DRAWNED;
                                await orderUpdate.save();
                                await orderUpdate.reload();

                                break;




                            // ĐẶT TỔ HỢP
                            case "tohop":
                                // code Tổ hợp 

                                break;
                        }


                        
                    }

                });


            } catch (error) {
                status = false, message = error;
            }

            break;

        default:
            status = false, message = "error game params";
            break;


    }

    return { status, message };

};



export default {
    updateResult
};
