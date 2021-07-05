import crypto from "crypto";

export const encryptPassword = (password: string) => {
    if (!password) return "";
    return crypto.createHash("sha256").update(password).digest("base64");
};