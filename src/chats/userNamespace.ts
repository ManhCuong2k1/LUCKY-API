import { } from "redis";

export default (io: any,socket: any) => {
    socket.on("sendMessage", function(data: any) {
        io.sockets
            .to(socket.currentRoom)
            .emit("updateChat", socket.username, data);
    });
};