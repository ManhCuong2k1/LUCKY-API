// Global variables to hold all usernames and rooms created
import { redisClient as redis } from "../database/redis";
import jwt from "jsonwebtoken";
import config from "../config";
import {UserInterface, UserModel} from "@models/User";
import {RoleModel} from "@models/Role";
import _ from "underscore";
import { ClientEvents, ServerEvents } from "@chats/SocketEvent";
import {GroupChatMemberModel} from "@models/GroupChatMember";
import {ChatLogModel} from "@models/ChatLog";

const usernames: any = {};

export default (io: any,socket: any) => {
    socket.auth = false;

    // Authenticate
    socket.on(ClientEvents.AUTHENTICATE, async (data: any) => {
        try {
            console.log("Authenticated: ", socket.id);
            const payload: any = jwt.verify(data.token, config.JWT_KEY);
            const user = await UserModel.findOne({
                where: { id: payload.id },
                attributes: ["id", "firstName", "lastName", "username", "nickname", "avatar", "gender", "isAdmin"],
                include: {
                    model: RoleModel,
                    as: "role",
                    attributes: ["slug"]
                }
            });

            redis.set(user.username, JSON.stringify(user.toJSON()));
            socket.auth = true;

            _.each(io.nsps, (nsp: any) => {
                if(_.findWhere(nsp.sockets, {id: socket.id})) {
                    console.log("restoring socket to", nsp.name);
                    nsp.connected[socket.id] = socket;
                }
            });

            socket.username = user.username;
            socket.userId = user.id;
            socket.emit(ServerEvents.AUTHENTICATED, user.toJSON());
            //
            // socket.currentRoom = "global";
            // socket.join("global");
            // socket.emit("updateChat", "INFO", "You have joined global room");
            // socket.broadcast
            //     .to("global")
            //     .emit("updateChat", "INFO", user.username + " has joined global room");
            // io.sockets.emit("updateUsers", usernames);
            // socket.emit("updateRooms", rooms, "global");

        } catch (e) {
            socket.auth = false;
            socket.emit(ServerEvents.UNAUTHENTICATED);
            socket.disconnect("unauthorized");
        }
    });

    setTimeout(() => {
        if (!socket.auth) {
            console.log("Disconnect", socket.id);
            socket.disconnect("unauthorized");
        }
    }, 1000);

    socket.on(ClientEvents.USER_POST_MESSAGE, async (message: any) => {
        redis.get(socket.username, ((err, user) => {
            if (!err) {
                message.authorId = socket.userId;
                message.groupChatId = socket.currentRoom;
                ChatLogModel.create(message).then((m) => {
                    const sendData = {
                        ...message,
                        id: m.id
                    };
                    socket.broadcast
                        .to(socket.currentRoom)
                        .emit(ServerEvents.USER_POST_MESSAGE, sendData);
                });
            } else {
                socket.disconnect("unauthorized");
            }
        }));
    });

    socket.on(ClientEvents.USER_TYPING, () => {
        redis.get(socket.username, ((err, user) => {
            if (!err) {
                socket.broadcast
                    .to(socket.currentRoom)
                    .emit(ServerEvents.USER_TYPING, JSON.parse(user));
            } else {
                socket.disconnect("unauthorized");
            }
        }));
    });

    socket.on(ClientEvents.USER_STOP_TYPING, () => {
        socket.broadcast
            .to(socket.currentRoom)
            .emit(ServerEvents.USER_STOP_TYPING);
    });

    socket.on(ClientEvents.USER_JOIN_ROOM, async (room: any) => {
        try {
            const groupChatMember = await GroupChatMemberModel.findOne({
                where: {
                    groupChatId: room.id,
                    userId: socket.userId
                }
            });

            if (!groupChatMember) throw new Error("Reject user join room");
            // Fetch history chat
            const chatLogs = await ChatLogModel.findAll({
               where: {
                   groupChatId: room.id
               },
                limit: 15,
                order: [
                    ["createdAt", "DESC"],
                ],
                include: [
                    {
                        model: UserModel,
                        as: "author",
                        attributes: ["id", "firstName", "lastName", "username", "avatar", "nickname"]
                    }
                ]
            });

            socket.currentRoom = room.id;
            socket.join(room.id);
            socket.emit(ServerEvents.ACCEPT_USER_JOIN_ROOM, {room, groupChatMember, chatLogs});
        } catch (e) {
            console.log("Reject: ", socket.id, socket.userId, room.id, e);
            socket.emit(ServerEvents.REJECT_USER_JOIN_ROOM);
        }
    });

    socket.on("disconnect", function() {
        console.log("Disconnect: ", socket.id);
    });

};
