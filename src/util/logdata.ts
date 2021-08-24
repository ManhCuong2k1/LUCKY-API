import fs from "fs";

export const creatLogFile = (path: string) => {
    try {
        fs.writeFile(path, "", (err) => { if (err) throw err; });
    } catch (err) {
        console.error(err);
    }
};

export const logFile = (path: string, content: any) => {
    try {
        fs.writeFileSync(path, content + "\n");
    } catch (err) {
        console.error(err.message);
    }
};

export const readlog = (path: string) => {
    try {
        return fs.readFileSync(path).toString();
    }catch (err) {
        console.log(err.message);
    }
};