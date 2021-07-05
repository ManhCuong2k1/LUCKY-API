import { DataTypes, Model } from "sequelize";
import connection from "@database/connection";

enum ChatLogType {
    TEXT, LINK, IMAGE
}

interface ChatLogInterface extends Model {
    id: number;
    type: ChatLogType;
    content: string;
    authorId: number;
    groupChatId: number;
}

const ChatLogDefine = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.STRING
    }
};

const ChatLogModel = connection.define<ChatLogInterface>("chat_logs", ChatLogDefine, {
    tableName: "chat_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt"
});

export  {
    ChatLogInterface,
    ChatLogType,
    ChatLogModel
};