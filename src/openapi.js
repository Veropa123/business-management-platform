export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Business Management Platform API",
    version: "0.1.0",
    description: "REST API for customers, work orders, operational tracking and dashboard KPIs."
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "Service is healthy" } }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Authenticate demo user",
        responses: { "200": { description: "JWT and user profile" } }
      }
    },
    "/api/dashboard": {
      get: {
        summary: "Operational KPIs",
        responses: { "200": { description: "Dashboard metrics" } }
      }
    },
    "/api/clients": {
      get: {
        summary: "List clients",
        responses: { "200": { description: "Client list" } }
      },
      post: {
        summary: "Create client",
        responses: {
          "201": { description: "Client created" },
          "401": { description: "Authentication required" }
        }
      }
    },
    "/api/work-orders": {
      get: {
        summary: "List work orders",
        responses: { "200": { description: "Work order list" } }
      },
      post: {
        summary: "Create work order",
        responses: {
          "201": { description: "Work order created" },
          "401": { description: "Authentication required" }
        }
      }
    }
  }
};
