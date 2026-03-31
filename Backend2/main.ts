// main.ts
// deno-lint-ignore-file no-explicit-any
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectRoutes from './routes/project.routes.ts';

import 'dotenv/config';
import express from "express";
import cors from "cors";

const app = express();

// Allow requests from anywhere (Vercel-friendly)
app.use(cors({
  origin: true,
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true,
}));

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

// ------------------- VERBOSE LOGGER -------------------
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
// Uncomment to use
// app.use(verboseLogger);

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
    servers: [{ url: `https://williamvance.app` }],
  },
  apis: ['./routes/*.ts', './controller/*.ts'],
} as any;

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve raw JSON spec for Swagger UI
app.get('/api-docs-json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI with absolute URL (Vercel-friendly)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Portfolio API Docs',
  customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
  customJs: [
    'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
  ],
  swaggerOptions: {
    url: 'https://williamvance.app/api-docs-json', // MUST be absolute
  },
}));

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