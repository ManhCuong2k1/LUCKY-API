import { Router, Request, Response } from "express";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";
import { LotteryImagesModel } from "@models/LotteryImages";
import { Image } from "@models/Images";
import { GridInterface } from "@models/Transformers/Grid";
import { authEmploye } from "../../../middleware/auth";

const router = Router();

/**
 * @openapi
 * /upload/single-upload:
 *   post:
 *     tags:
 *      - "[App] uploads"
 *     summary: "API upload một hình ảnh"
 *     consumes:
 *      - "multipart/form-data"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "image"
 *        in: "formData"
 *        description: "File upload"
 *        required: false
 *        type: "file"
 *     responses:
 *       200:
 *         description: "Upload success"
 *       400:
 *         description: "Upload failed"
 *     security:
 *      - Bearer: []
 */
router.post("/single-upload", [ authEmploye, upload.single("file") ], async (req: Request, res: Response) => {
    try {
        const user: any = req.user;
        if (!req.file) throw new Error("No file to upload");
        const fileName = await saveFile(req.file);
        const newImage: any = {
            imageUrl: fileName,
            UserId: user.id
        };
        await Image.create(newImage);
        res.send(newImage);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }

});

/**
 * @openapi
 * /upload/multi-upload:
 *   post:
 *     tags:
 *      - "[App] uploads"
 *     summary: "API upload nhiều hình ảnh cùng lúc"
 *     consumes:
 *      - "multipart/form-data"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - name: "images"
 *        in: "formData"
 *        description: "File upload"
 *        required: false
 *        allowMultiple: true
 *        type: "file"
 *     responses:
 *       200:
 *         description: "Upload success"
 *       400:
 *         description: "Upload failed"
 *     security:
 *      - Bearer: []
 */
router.post("/multi-upload",upload.array("image"), async (req: Request, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) throw new Error("No file to upload");
        const files: any[] = [];
        const fileKeys = Object.keys(req.files);
        fileKeys.forEach(function(key) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            files.push(req.files[key]);
        });

        const images: any[] = [];

        await Promise.all(
            files.map(async file => {
                const fileName = await saveFile(file);
                images.push({url: fileName});
            })
        );

        return res.send(images);
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});

/**
 * @openapi
 * /upload/images:
 *   get:
 *     tags:
 *      - "[App] uploads"
 *     summary: Lấy list ảnh đã uploads
 *     parameters:
 *      - in: "query"
 *        name: "page & pageSize"
 *        description: "page và pageSize"
 *        require: true
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */

router.get("/images", authEmploye, async (req: Request, res: Response) => {
    try {
        const user: any = req.user;
        const page: number = parseInt(req.query.page ? req.query.page.toString() : "1");
        const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : "99999");
        const cursor: number = (page - 1) * pageSize;
        
        const { rows, count } = await Image.findAndCountAll({
            where: {
                UserId: user.id
            },
            limit: pageSize,
            offset: cursor,
            order: [
                ["createdAt", "DESC"],
            ],
        });
        const responseData: GridInterface<Image> = {
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


/**
 * @openapi
 * /upload/images/:id:
 *   get:
 *     tags:
 *      - "[App] uploads"
 *     summary: Lấy thông tin ảnh đã uploads
 *     parameters:
 *      - in: "query"
 *        name: "Images ID"
 *        description: "id của hình ảnh"
 *        require: true
 *     responses:
 *       200:
 *         description: Return data.
 *       400:
 *         description: Error can't get data.
 */
router.get("/images/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const responseData = await LotteryImagesModel.findOne({
            where: {
                LotteryTicketModelId: id,
            }
        });
        res.send({data: responseData});
    } catch (e) {
        res.status(400).send({
            error: e.message
        });
    }
});


export default router;