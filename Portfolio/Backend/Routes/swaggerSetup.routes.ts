// @deno-types="npm:@types/express"
import express, { Express } from "npm:express";
import swaggerJSDoc from "npm:swagger-jsdoc";
import swaggerUi from "npm:swagger-ui-express";

// ----- Swagger setup for all APIs -----
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admissions App API",
      version: "1.0.0",
      description:
        "Combined API documentation for Schools, Events, and Admissions Representatives",
    },
   servers: [
  { url: "http://localhost:4050/api" },
],

  },
  apis: [
    "./controller/projects.router.ts", // file path fixed
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at http://localhost:4050/api-docs");
}
