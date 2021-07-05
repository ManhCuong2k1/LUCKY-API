import swaggerJsDoc from "swagger-jsdoc";
import config from "../config";

const swaggerDefinition = {
    info: {
        title: "API Piggi App Client",
        version: "1.0.0",
        description: "This is the REST API for project Piggi App"
    },
    host: config.HOST,
    basePath: "/api",
    tags: [
        {
            name: "[App] auth",
            description: ""
        },
        {
            name: "[App] uploads",
            description: "API upload hình ảnh cho avatar, feed"
        },
        {
            name: "[App] users",
            description: "API lấy thông tin user"
        },
        {
            name: "[App] group-chats",
            description: "API lấy data group chat"
        },
        {
            name: "[App] feeds",
            description: "API danh sách feeds"
        }
    ],
    securityDefinitions: {
        Bearer: {
            type: "apiKey",
            schema: "bearer",
            name: "Authorization",
            in: "header",
            prefix: "Bearer "
        }
    },
    definitions: {}
};

const options = {
    swaggerDefinition,
    explorer: true,
    apis: ["**/*.ts"]
};
export default swaggerJsDoc(options);