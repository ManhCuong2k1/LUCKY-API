import { Router } from "express";
import upload from "@middleware/upload";
import { saveFile } from "@util/resizeImage";

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
router.post("/single-upload",upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) throw new Error("No file to upload");
        const fileName = await saveFile(req.file);
        return res.send({ url: fileName });
    } catch (e) {
        console.log(e);
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
router.post("/multi-upload",upload.array("image"), async (req, res, next) => {
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


export default router;