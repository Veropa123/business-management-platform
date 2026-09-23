export const config = {
  env: process.env.APP_ENV || "development",
  port: Number(process.env.PORT || 8000),
  databaseUrl: process.env.DATABASE_URL || "",
  demoMode: (process.env.DEMO_MODE || "true").toLowerCase() === "true",
  jwtSecret: process.env.JWT_SECRET || "development-only-secret",
};
