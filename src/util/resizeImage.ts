import path from "path";
import fs from "fs";

const getFileName = () => {
    return new Date().getTime().toString();
};

interface SizeInterface {
    width: number;
    height: number;
}

const saveFile = async (file: any, category: any) => {
    const fileNameImage: string = getFileName();

    const imageFolder = path.join(__dirname, "../../public/images/" + category);
    const ext = path.extname(file.originalname);
    const filePath = path.resolve(`${imageFolder}/${fileNameImage}${ext}`);
    console.log(filePath);
    
    fs.mkdir(path.join(__dirname, "../../public/images/" + category), async () => {
        console.log("Created folder images!");
    });
    console.log("Folder check done!");
    // await sharp(file.buffer).toFile(filePath);
    fs.writeFile(filePath, file.buffer, "binary", function(err){
        if (err) throw err;
        console.log("File saved.");
    });
    return `images/${category}/${fileNameImage}${ext}`;
};

export {
    saveFile
};
