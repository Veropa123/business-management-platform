const now = () => new Date().toISOString();

const initialClients = [
  { id: 1, name: "Laura Martinez", company: "Nova Industries", email: "laura@nova.example", phone: "+1 555 0101", status: "active", created_at: now() },
  { id: 2, name: "David Chen", company: "Apex Logistics", email: "david@apex.example", phone: "+1 555 0102", status: "active", created_at: now() },
  { id: 3, name: "Sofia Ramirez", company: "Orion Retail", email: "sofia@orion.example", phone: "+1 555 0103", status: "active", created_at: now() },
  { id: 4, name: "Michael Brown", company: "Vertex Labs", email: "michael@vertex.example", phone: "+1 555 0104", status: "inactive", created_at: now() }
];

const initialOrders = [
  { id: 101, client_id: 1, client_name: "Nova Industries", title: "Production dashboard upgrade", description: "Improve operations dashboard and reporting.", priority: "high", status: "in_progress", assignee: "Veronica", due_date: "2026-10-02", created_at: now(), updated_at: now() },
  { id: 102, client_id: 2, client_name: "Apex Logistics", title: "API integration review", description: "Review external shipping API integration.", priority: "medium", status: "open", assignee: "Veronica", due_date: "2026-10-04", created_at: now(), updated_at: now() },
  { id: 103, client_id: 3, client_name: "Orion Retail", title: "Automated sales report", description: "Automate weekly sales reporting.", priority: "high", status: "review", assignee: "Daniel", due_date: "2026-09-29", created_at: now(), updated_at: now() },
  { id: 104, client_id: 1, client_name: "Nova Industries", title: "Device telemetry endpoint", description: "Create endpoint for industrial device telemetry.", priority: "medium", status: "completed", assignee: "Ana", due_date: "2026-09-20", created_at: now(), updated_at: now() },
  { id: 105, client_id: 2, client_name: "Apex Logistics", title: "Customer import validation", description: "Validate bulk customer imports.", priority: "low", status: "completed", assignee: "Veronica", due_date: "2026-09-18", created_at: now(), updated_at: now() },
  { id: 106, client_id: 3, client_name: "Orion Retail", title: "Inventory API issue", description: "Investigate intermittent inventory sync errors.", priority: "urgent", status: "open", assignee: "Daniel", due_date: "2026-09-26", created_at: now(), updated_at: now() }
];

export class MemoryStore {
  constructor() {
    this.clients = structuredClone(initialClients);
    this.orders = structuredClone(initialOrders);
  }

  async init() {}

  async listClients(search = "") {
    const term = search.trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients.filter((client) =>
      [client.name, client.company, client.email].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }

  async createClient(input) {
    const client = {
      id: Math.max(0, ...this.clients.map((item) => item.id)) + 1,
      ...input,
      status: input.status || "active",
      created_at: now()
    };
    this.clients.push(client);
    return client;
  }

  async listOrders({ status = "", priority = "" } = {}) {
    return this.orders.filter((order) =>
      (!status || order.status === status) &&
      (!priority || order.priority === priority)
    );
  }

  async createOrder(input) {
    const client = this.clients.find((item) => item.id === input.client_id);
    if (!client) {
      const error = new Error("Client not found.");
      error.code = "CLIENT_NOT_FOUND";
      throw error;
    }

    const order = {
      id: Math.max(100, ...this.orders.map((item) => item.id)) + 1,
      ...input,
      client_name: client.company || client.name,
      status: input.status || "open",
      priority: input.priority || "medium",
      assignee: input.assignee || "Unassigned",
      due_date: input.due_date || null,
      created_at: now(),
      updated_at: now()
    };
    this.orders.push(order);
    return order;
  }

  async updateOrderStatus(id, status) {
    const order = this.orders.find((item) => item.id === Number(id));
    if (!order) return null;
    order.status = status;
    order.updated_at = now();
    return order;
  }

  async dashboard() {
    const openOrders = this.orders.filter((order) => order.status !== "completed");
    const completed = this.orders.filter((order) => order.status === "completed");
    const urgent = this.orders.filter((order) => order.priority === "urgent" && order.status !== "completed");

    const byStatus = this.orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total_clients: this.clients.length,
      active_clients: this.clients.filter((client) => client.status === "active").length,
      open_work_orders: openOrders.length,
      completed_work_orders: completed.length,
      urgent_work_orders: urgent.length,
      completion_rate: this.orders.length ? Math.round((completed.length / this.orders.length) * 1000) / 10 : 0,
      work_orders_by_status: byStatus
    };
  }
}
