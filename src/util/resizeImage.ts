import axios from "axios";
import FormData from "form-data";

const saveFile = async (file: any) => {
    const img1 = new FormData();
    img1.append("file", file.buffer);
    
    
    const postImg1 = await axios({
        method: "post",
        url: process.env.HOST_IMAGES_URL + "/images?category=content",
        headers: {
            ...img1.getHeaders()
        },
        data: img1
    });
    console.log(postImg1.data);

    return postImg1.data;
};

export {
    saveFile
};
