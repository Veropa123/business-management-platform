# Business Management Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-4C6EF5?style=for-the-badge)](https://business-management-platform-kqbk.onrender.com/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-009688?style=for-the-badge)](https://business-management-platform-kqbk.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Veropa123/business-management-platform)

> **Live application:** https://business-management-platform-kqbk.onrender.com/

A portfolio-ready business operations platform for managing customers, service requests, work orders, assignments, priorities, status tracking, and operational KPIs.

## Overview

This project demonstrates a common internal-business application workflow:

```text
Browser Dashboard
       |
       v
Node.js / Express
       |
       +----> REST API
       |
       +----> JWT-protected write operations
       |
       +----> Zod request validation
       |
       +----> Demo memory store / PostgreSQL adapter
```

The public demo runs in a safe in-memory mode so it can be tested without external infrastructure. The application also includes a PostgreSQL data-store implementation and SQL schema that can be enabled through environment variables.

## Features

- Responsive operations dashboard
- Customer directory
- Client search
- Work-order tracking
- Status and priority filters
- Operational KPI cards
- REST API
- JWT authentication for write operations
- Request validation with Zod
- Demo-memory storage for public deployment
- PostgreSQL-compatible persistence layer
- SQL schema and indexes
- Swagger/OpenAPI documentation
- Automated API tests
- Docker and Docker Compose
- GitHub Actions CI
- Public deployment on Render

## Tech Stack

- JavaScript
- Node.js
- Express
- PostgreSQL / pg
- Zod
- JSON Web Tokens
- bcryptjs
- HTML/CSS/JavaScript
- Node Test Runner
- Supertest
- Docker
- GitHub Actions

## Demo Credentials

Write endpoints require authentication.

```text
Email:    admin@demo.local
Password: PortfolioDemo123!
```

These credentials are only for the public portfolio demo.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Application health check |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/dashboard` | Return operational KPI metrics |
| GET | `/api/clients` | List/search clients |
| POST | `/api/clients` | Create a client (JWT required) |
| GET | `/api/work-orders` | List/filter work orders |
| POST | `/api/work-orders` | Create a work order (JWT required) |
| PATCH | `/api/work-orders/:id/status` | Update work-order status (JWT required) |
| GET | `/docs` | Interactive API documentation |

## Live Demo

Open the deployed application:

https://business-management-platform-kqbk.onrender.com/

Interactive API documentation:

https://business-management-platform-kqbk.onrender.com/docs

Health check:

https://business-management-platform-kqbk.onrender.com/health

> The free Render instance may take a short time to wake up after periods of inactivity.

## Project Structure

```text
business-management-platform/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── db/
│   │   └── schema.sql
│   ├── store/
│   │   ├── index.js
│   │   ├── memory-store.js
│   │   └── postgres-store.js
│   ├── app.js
│   ├── auth.js
│   ├── config.js
│   ├── openapi.js
│   ├── server.js
│   └── validation.js
├── tests/
│   └── app.test.js
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── package.json
├── README.md
└── render.yaml
```

## Run Locally

Clone the repository:

```bash
git clone https://github.com/Veropa123/business-management-platform.git
cd business-management-platform
```

Install dependencies:

```bash
npm install
```

Copy the environment example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the application:

```bash
npm start
```

Then open:

```text
Dashboard: http://127.0.0.1:8000
API docs:  http://127.0.0.1:8000/docs
```

## Demo Mode

The default configuration uses:

```env
DEMO_MODE=true
```

This loads sample customers and work orders into memory, making the project immediately demonstrable without a database account.

## PostgreSQL Mode

To use PostgreSQL:

1. Create a PostgreSQL database.
2. Set `DEMO_MODE=false`.
3. Set `DATABASE_URL` to the database connection string.
4. Start the application.

The app automatically executes `src/db/schema.sql` during startup.

Example:

```env
DEMO_MODE=false
DATABASE_URL=postgresql://user:password@host:5432/business_platform
```

## Docker

```bash
docker compose up --build
```

The included Docker Compose configuration runs the public demo mode.

## Testing

```bash
npm test
```

The test suite verifies health checks, KPI responses, filtering, authentication requirements, and demo login.

GitHub Actions runs the tests automatically on pushes to `main` and pull requests.

## Security Notes

- Write operations require a JWT.
- Password comparison uses bcrypt.
- Input payloads are validated with Zod.
- HTTP security headers are provided by Helmet.
- Production deployments should always replace the default JWT secret.
- Demo credentials should never be reused in a real production system.

## Portfolio Purpose

This project is built as a complete business-software case study rather than a basic CRUD exercise. It demonstrates backend architecture, REST API design, authentication, validation, configurable persistence, business dashboards, testing, containerization, CI, and deployment preparation.

## Status

**Live and publicly deployed.**

## License

MIT
