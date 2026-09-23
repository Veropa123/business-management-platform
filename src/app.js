import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { ZodError } from "zod";

import { authenticate, requireAuth } from "./auth.js";
import { config } from "./config.js";
import { openapiSpec } from "./openapi.js";
import {
  clientSchema,
  loginSchema,
  orderSchema,
  statusSchema
} from "./validation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(store) {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(config.env === "test" ? "tiny" : "combined"));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      environment: config.env,
      storage: config.demoMode || !config.databaseUrl ? "demo-memory" : "postgresql"
    });
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await authenticate(credentials.email, credentials.password);

      if (!result) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/dashboard", async (_req, res, next) => {
    try {
      res.json(await store.dashboard());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/clients", async (req, res, next) => {
    try {
      res.json(await store.listClients(String(req.query.search || "")));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/clients", requireAuth, async (req, res, next) => {
    try {
      const input = clientSchema.parse(req.body);
      const client = await store.createClient(input);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/work-orders", async (req, res, next) => {
    try {
      const filters = {
        status: String(req.query.status || ""),
        priority: String(req.query.priority || "")
      };
      res.json(await store.listOrders(filters));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/work-orders", requireAuth, async (req, res, next) => {
    try {
      const input = orderSchema.parse(req.body);
      const order = await store.createOrder(input);
      res.status(201).json(order);
    } catch (error) {
      if (error?.code === "CLIENT_NOT_FOUND") {
        return res.status(404).json({ error: error.message });
      }
      return next(error);
    }
  });

  app.patch("/api/work-orders/:id/status", requireAuth, async (req, res, next) => {
    try {
      const { status } = statusSchema.parse(req.body);
      const order = await store.updateOrderStatus(req.params.id, status);

      if (!order) {
        return res.status(404).json({ error: "Work order not found." });
      }

      return res.json(order);
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Endpoint not found." });
    }
    return res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed.",
        details: error.issues
      });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  });

  return app;
}
