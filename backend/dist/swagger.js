"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "College Enrollment Platform API",
        version: "1.0.0",
        description: "API documentation for the College Enrollment Platform backend",
    },
    servers: [
        {
            url: "http://localhost:8080",
            description: "Local development server",
        },
    ],
};
const swaggerOptions = {
    definition: swaggerDefinition,
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
function setupSwagger(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve);
    app.get("/api-docs", swagger_ui_express_1.default.setup(swaggerSpec));
}
