import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const clientSchema = z.object({
  name: z.string().min(2).max(160),
  company: z.string().max(160).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  phone: z.string().max(80).optional().default(""),
  status: z.enum(["active", "inactive"]).optional().default("active")
});

export const orderSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  title: z.string().min(3).max(180),
  description: z.string().max(2000).optional().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  status: z.enum(["open", "in_progress", "review", "completed"]).optional().default("open"),
  assignee: z.string().max(120).optional().default(""),
  due_date: z.string().optional().nullable()
});

export const statusSchema = z.object({
  status: z.enum(["open", "in_progress", "review", "completed"])
});
