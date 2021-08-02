import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "@util/constants";
import config from "../config";
import {  UserModel, UserInterface } from "@models/User";
import { Op } from "sequelize";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const payload: any = jwt.verify(token, config.JWT_KEY);
        const user: UserInterface = await UserModel.findOne({
            where: { id: payload.id, role: UserModel.ROLE_ENUM.USER },
        });
        if (user == null) {
            return res.status(401).send({ code: ERROR_CODES.InvalidOrExpiredToken });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({
            error: "Not authorized to access this resource",
            code: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
        });
    }
};


export const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const payload: any = jwt.verify(token, config.JWT_KEY);
        const user: UserInterface = await UserModel.findOne({
            where: { id: payload.id, role: UserModel.ROLE_ENUM.ADMIN }
        });
        if (user == null) {
            return res.status(401).send({ code: "ERROR: PERMISSTION DENIED!" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({
            error: "Not authorized to access this resource",
            code: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
        });
    }
};


export const authEmploye = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const payload: any = jwt.verify(token, config.JWT_KEY);
        const user: UserInterface = await UserModel.findOne({
            where: {
                id: payload.id,
                [Op.or]: [
                    { role: UserModel.ROLE_ENUM.EMPLOYE }, 
                    { role: UserModel.ROLE_ENUM.ADMIN }
                ],
            }
        });
        if (user == null) {
            return res.status(401).send({ code: "ERROR: PERMISSTION DENIED!" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({
            error: "Not authorized to access this resource",
            code: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
        });
    }
};