import path from "path";
import moment from "moment-timezone";
import fs from "fs";
import slugify from "slugify";

const saveFile = async (file: any) => {
    const currentDate = moment().format("MM-YYYY");
    const orifinalName = file.originalname.split(".");
    const editName = orifinalName.slice(0, orifinalName.length - 1)[0] + "-" + new Date().getTime();
    const fileName = slugify(editName, { strict: true });

    const imageFolder = path.join(__dirname, "../../public/images/" + currentDate);
    const ext = path.extname(file.originalname);
    const filePath = path.resolve(`${imageFolder}/${fileName}${ext}`);
    
    fs.mkdir(path.join(__dirname, "../../public/images/" + currentDate), async () => {
        console.log("Created folder images!");
    });
    fs.writeFile(filePath, file.buffer, "binary", function(err){
        if (err) throw err;
        console.log("File saved.");
    });
    return `${currentDate}/${fileName}${ext}`;
};

export {
    saveFile
};
