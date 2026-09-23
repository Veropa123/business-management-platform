import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { config } from "./config.js";

const DEMO_USER = {
  id: 1,
  name: "Portfolio Admin",
  email: "admin@demo.local",
  role: "admin",
  passwordHash: bcrypt.hashSync("PortfolioDemo123!", 10)
};

export async function authenticate(email, password) {
  if (email !== DEMO_USER.email) return null;
  const valid = await bcrypt.compare(password, DEMO_USER.passwordHash);
  if (!valid) return null;

  const user = {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    role: DEMO_USER.role
  };

  const token = jwt.sign(user, config.jwtSecret, { expiresIn: "2h" });
  return { token, user };
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Authentication required." });
  }
}
