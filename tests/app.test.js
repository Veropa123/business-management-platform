import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import { createApp } from "../src/app.js";
import { MemoryStore } from "../src/store/memory-store.js";

function app() {
  return createApp(new MemoryStore());
}

test("GET /health returns healthy status", async () => {
  const response = await request(app()).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("GET /api/dashboard returns business KPIs", async () => {
  const response = await request(app()).get("/api/dashboard");

  assert.equal(response.status, 200);
  assert.equal(response.body.total_clients, 4);
  assert.equal(response.body.open_work_orders, 4);
});

test("GET /api/work-orders filters by priority", async () => {
  const response = await request(app()).get("/api/work-orders?priority=urgent");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].priority, "urgent");
});

test("POST /api/clients requires authentication", async () => {
  const response = await request(app())
    .post("/api/clients")
    .send({ name: "New Client" });

  assert.equal(response.status, 401);
});

test("demo login returns a JWT", async () => {
  const response = await request(app())
    .post("/api/auth/login")
    .send({
      email: "admin@demo.local",
      password: "PortfolioDemo123!"
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
});
