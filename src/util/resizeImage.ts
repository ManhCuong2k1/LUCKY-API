import path from "path";
import moment from "moment-timezone";
import fs from "fs";

const getFileName = () => {
    return new Date().getTime().toString();
};

interface SizeInterface {
    width: number;
    height: number;
}

const saveFile = async (file: any) => {
    const currentDate = moment().format("DD-MM-YYYY");
    const orifinalName = file.originalname.split(".");
    const editName = orifinalName.slice(0, orifinalName.length - 1)[0] + "-" + new Date().getTime();

    const fileNameImage: string = getFileName();

    const imageFolder = path.join(__dirname, "../../public/images/" + currentDate);
    const ext = path.extname(file.originalname);
    const filePath = path.resolve(`${imageFolder}/${fileNameImage}${ext}`);
    console.log(filePath);
    
    fs.mkdir(path.join(__dirname, "../../public/images/" + currentDate), async () => {
        console.log("Created folder images!");
    });
    console.log("Folder check done!");
    // await sharp(file.buffer).toFile(filePath);
    fs.writeFile(filePath, file.buffer, "binary", function(err){
        if (err) throw err;
        console.log("File saved.");
    });
    return `${currentDate}/${fileNameImage}${ext}`;
};

export {
    saveFile
};
