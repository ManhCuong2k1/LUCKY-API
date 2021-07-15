import md5 from "md5";

export const encryptPassword = (password: string) => {
    if (!password) return "";
    return md5(md5(md5(md5(md5(password)))));
};