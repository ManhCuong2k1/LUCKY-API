import Crawl from "@controllers/api/crawl/Crawl";
import updateTicket from "@controllers/api/app/lottery/updateresult";
import updateLoto from "@controllers/api/app/lottery/updateresultloto";
import { LotteryResultsModel } from "@models/LotteryResults";

export const TaskKeno = async () => {
    try {
        const crawling = await Crawl.XosoKenoData();
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.KENO, crawling.data);
    } catch (e) {
        console.log(e.message);
    }
};

export const TaskMegaPowerMax3dMax4d = async () => {
    try {
        const crawlingMega = await Crawl.XosoMegaData();
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MEGA, crawlingMega.data);

        const crawlingPower = await Crawl.XosoPowerData();
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.POWER, crawlingPower.data);

        const crawlingMax3d = await Crawl.XosoMax3dData();
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3D, crawlingMax3d.data);
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX3DPLUS, crawlingMax3d.data);

        const crawlingMax4d = await Crawl.XosoMax4dData();
        await updateTicket.updateResult(LotteryResultsModel.GAME_ENUM.MAX4D, crawlingMax4d.data);
    } catch (e) {
        console.log(e.message);
    }
};

export const TaskCompute = async () => {
    try {
        const DienToan123 = await Crawl.DienToan123();
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.COMPUTE123, DienToan123.data);
        const Xoso6x36 = await Crawl.Xoso6x36();
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.COMPUTE636, Xoso6x36.data);
    }catch(e) {
        console.log(e.message);
    }
};

export const TaskXsmb = async () => {
    try {
        const crawling = await Crawl.XosoMienBac();
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.KIENTHIET, crawling.data);
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO2, crawling.data);
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO3, crawling.data);
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO5, crawling.data);

        const lotoResult = await Crawl.LotoCrawl();
        await updateLoto.updateResultLoto(LotteryResultsModel.GAME_ENUM.LOTO234, lotoResult.data);
    }catch(e) {
        console.log(e.message);
    }
};


export const TaskGetRound = async () => {
    try {
        await Crawl.getPowerRound();
        await Crawl.getMegaRound();
        await Crawl.getMax3DRound();
        await Crawl.getMax4DRound();
    }catch(e) {
        console.log(e.message);
    }
};