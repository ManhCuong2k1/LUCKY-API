import { Router } from "express";
import { GridInterface } from "@models/Transformers/Grid";
import { DiscountCrawlInterface, DiscountCrawlModel } from "@models/DiscountCrawl";
import { Op } from "sequelize";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const query = req.query;
        const page: number = parseInt(query.page ? query.page.toString() : "1");
        const pageSize: number = parseInt(query.pageSize ? query.pageSize.toString() : "20");
        const cursor: number = (page - 1) * pageSize;

        const fromDateAlive: any = query.fromDateAlive || null;
        const toDateAlive: any = query.toDateAlive || null;

        const fromDateUpdated: any = query.fromDateUpdated ? new Date(parseInt(query.fromDateUpdated.toString())*1000) : null;
        const toDateUpdated: any = query.toDateUpdated ? new Date(parseInt(query.toDateUpdated.toString())*1000) : null;

        const offer: any = query.offer ? query.offer : null;

        const searchKey: any = query.searchKey ? query.searchKey : null;

        let expiredAt = null;
        let updatedAt = null;
        let couponCode = null;
        
        if (fromDateAlive && toDateAlive){
            expiredAt = {
                [Op.between]: [fromDateAlive, toDateAlive],  
            };
        }

        if (fromDateUpdated && toDateUpdated){
            updatedAt = {
                [Op.between]: [fromDateUpdated, toDateUpdated],  
            };
        }

        if (searchKey){
            couponCode = { [Op.like]: `%${searchKey}%` };
        }

        const where = Object.assign({},
            expiredAt === null ? null : {expiredAt},
            updatedAt === null ? null : {updatedAt},
            offer === null ? null : {offer},
            couponCode === null ? null : {couponCode},
        );
        console.log(where);

        const { rows, count } = await DiscountCrawlModel.findAndCountAll({
            order: [
                ["createdAt", "DESC"],
            ],
            where,
            limit: pageSize,
            offset: cursor
        });

        const responseData: GridInterface<DiscountCrawlInterface> = {
            data: rows,
            page: page,
            pageSize: pageSize,
            total: count
        };
        res.send(responseData);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.get("/show/:discountId", async (req, res) => {
    try {
        const discount = await DiscountCrawlModel.findByPk(req.params.discountId);
        const discountJson: any = discount.toJSON();
        res.send({ data: discountJson });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.put("/update/:discountId", async (req, res) => {
    try {
        const discount = await DiscountCrawlModel.findByPk(req.params.discountId);
        const discountUpdate = req.body;
        discount.offer = discountUpdate.offer;
        discount.title = discountUpdate.title;
        discount.subTitle = discountUpdate.subTitle;
        discount.status = discountUpdate.status ? "publish" : "draft";
        discount.startAt = discountUpdate.startAt;
        discount.expiredAt = discountUpdate.expiredAt;
        discount.couponCode = discountUpdate.couponCode;
        discount.discountAmount = discountUpdate.discountAmount;
        discount.longDescription = discountUpdate.longDescription;
        discount.shortDescription = discountUpdate.shortDescription;

        await discount.save();
        res.send({ data: discount });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.post("/create", async (req, res) => {
    try {
        const discountCreate = req.body;
        discountCreate.status = discountCreate.status ? "publish" : "draft";

        const savedDiscount = await DiscountCrawlModel.create(discountCreate);
        res.send({ data: savedDiscount });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.delete("/delete/:discountId", async (req, res) => {
    try {
        const discount = await DiscountCrawlModel.findByPk(req.params.discountId);
        discount.status = "draft";
        await discount.save();
        res.send({ data: discount });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.put("/restore/:discountId", async (req, res) => {
    try {
        const discount = await DiscountCrawlModel.findByPk(req.params.discountId);
        discount.status = "publish";
        await discount.save();
        res.send({ data: discount });
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

export default router;