import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import config from "../config";

const getFileName = () => {
    return uuidv4();
};

interface SizeInterface {
    width: number;
    height: number;
}

const saveFile = async (file: any, size?: SizeInterface) => {
    const imageFolder =  path.join(__dirname, "../../public/images");
    const fileName: string = getFileName();
    const filePath = path.resolve(`${imageFolder}/${fileName}.jpg`);
    await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg( { quality: 90})
        .toFile(filePath);

    return `${config.HOST_URL}/images/${fileName}.jpg`;
};

export {
    saveFile
};