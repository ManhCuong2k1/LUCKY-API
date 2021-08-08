import axios from "axios";
import FormData from "form-data";

const saveFile = async (file: any) => {
    const initImage = new FormData();
    initImage.append("file", file.buffer);
    
    const postImage = await axios({
        method: "post",
        url: process.env.HOST_IMAGES_URL + "/images?category=content",
        headers: {
            ...initImage.getHeaders()
        },
        data: initImage
    });
    return postImage.data;
};

export {
    saveFile
};
