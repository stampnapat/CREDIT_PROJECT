import { Express } from "express";
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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

const swaggerOptions: Options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

