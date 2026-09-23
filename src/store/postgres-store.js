import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PostgresStore {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
    });
  }

  async init() {
    const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");
    await this.pool.query(schema);
  }

  async listClients(search = "") {
    const term = search.trim();
    const { rows } = await this.pool.query(
      `SELECT * FROM clients
       WHERE $1 = ''
          OR name ILIKE '%' || $1 || '%'
          OR COALESCE(company, '') ILIKE '%' || $1 || '%'
          OR COALESCE(email, '') ILIKE '%' || $1 || '%'
       ORDER BY id`,
      [term]
    );
    return rows;
  }

  async createClient(input) {
    const { rows } = await this.pool.query(
      `INSERT INTO clients (name, company, email, phone, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.name, input.company || null, input.email || null, input.phone || null, input.status || "active"]
    );
    return rows[0];
  }

  async listOrders({ status = "", priority = "" } = {}) {
    const { rows } = await this.pool.query(
      `SELECT wo.*, COALESCE(c.company, c.name) AS client_name
       FROM work_orders wo
       JOIN clients c ON c.id = wo.client_id
       WHERE ($1 = '' OR wo.status = $1)
         AND ($2 = '' OR wo.priority = $2)
       ORDER BY wo.id DESC`,
      [status, priority]
    );
    return rows;
  }

  async createOrder(input) {
    const { rows } = await this.pool.query(
      `INSERT INTO work_orders
        (client_id, title, description, priority, status, assignee, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.client_id,
        input.title,
        input.description || null,
        input.priority || "medium",
        input.status || "open",
        input.assignee || null,
        input.due_date || null
      ]
    );

    const order = rows[0];
    const clientResult = await this.pool.query(
      "SELECT COALESCE(company, name) AS client_name FROM clients WHERE id = $1",
      [order.client_id]
    );
    return { ...order, client_name: clientResult.rows[0]?.client_name || "Unknown" };
  }

  async updateOrderStatus(id, status) {
    const { rows } = await this.pool.query(
      `UPDATE work_orders
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status]
    );
    return rows[0] || null;
  }

  async dashboard() {
    const [{ rows: clientRows }, { rows: orderRows }, { rows: statusRows }] = await Promise.all([
      this.pool.query(`
        SELECT COUNT(*)::int AS total_clients,
               COUNT(*) FILTER (WHERE status = 'active')::int AS active_clients
        FROM clients
      `),
      this.pool.query(`
        SELECT COUNT(*) FILTER (WHERE status <> 'completed')::int AS open_work_orders,
               COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_work_orders,
               COUNT(*) FILTER (WHERE priority = 'urgent' AND status <> 'completed')::int AS urgent_work_orders,
               CASE WHEN COUNT(*) = 0 THEN 0
                    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)) * 100, 1)
               END AS completion_rate
        FROM work_orders
      `),
      this.pool.query("SELECT status, COUNT(*)::int AS count FROM work_orders GROUP BY status")
    ]);

    return {
      ...clientRows[0],
      ...orderRows[0],
      completion_rate: Number(orderRows[0].completion_rate),
      work_orders_by_status: Object.fromEntries(statusRows.map((row) => [row.status, row.count]))
    };
  }
}
