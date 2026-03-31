// main.ts
// deno-lint-ignore-file no-explicit-any
import bodyParser from 'npm:body-parser';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectRoutes from './routes/project.routes.ts';
import swaggerUi from 'npm:swagger-ui-express';
import swaggerJsdoc from 'npm:swagger-jsdoc';

import express from "express";
import cors from "cors";

const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true,
}));

// ... your routes
const PORT = process.env.PORT || 3050;

// Fix __dirname for Deno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting backend server...");

// ------------------- MIDDLEWARES ------------------- //

// Body parser
app.use(bodyParser.json());

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// ------------------- OPTIONAL COMMENT MACHINE ------------------- //
// Uncomment the next line to enable verbose logging for every request
// app.use(verboseLogger); 
function verboseLogger(req: any, res: any, next: any) {
  console.log("==================== NEW REQUEST ====================");
  console.log(`[REQ] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Query params:", req.query);
  console.log("Route params (if any):", req.params);
  console.log("Body:", req.body);

  const send = res.send;
  res.send = function (body: any) {
    console.log("[RES] Status:", res.statusCode);
    console.log("[RES] Body:", body);
    return send.call(this, body);
  };
  next();
}

// ------------------- ROUTES ------------------- //
app.use('/api/projects', projectRoutes);

// ------------------- SWAGGER ------------------- //
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'API for managing portfolio projects',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./routes/*.ts', './controller/*.ts'],
} as any;

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------- CATCH-ALL & ERROR ------------------- //

// 404 catch-all
app.use((_req, res) => {
  console.log("[404] Route not found");
  res.status(404).json({ error: "Route not found" });
});

// Error middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[ERROR MIDDLEWARE] Caught error:", err);
  res.status(500).json({ error: "Internal server error", details: err });
});

// ------------------- START SERVER ------------------- //
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});