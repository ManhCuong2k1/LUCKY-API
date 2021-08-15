import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileFolder = path.join(__dirname, "../../public/uploads/");
    
    cb(null, fileFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadFile = multer({ storage: storage });
