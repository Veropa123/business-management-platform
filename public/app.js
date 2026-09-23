const kpiGrid = document.querySelector("#kpi-grid");
const ordersBody = document.querySelector("#orders-body");
const clientsList = document.querySelector("#clients-list");
const statusFilter = document.querySelector("#status-filter");
const priorityFilter = document.querySelector("#priority-filter");
const clientSearch = document.querySelector("#client-search");
const statusEl = document.querySelector("#status");

statusFilter.addEventListener("change", loadOrders);
priorityFilter.addEventListener("change", loadOrders);

let searchTimer;
clientSearch.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadClients, 180);
});

async function loadDashboard() {
  const response = await fetch("/api/dashboard");
  if (!response.ok) throw new Error("Could not load dashboard metrics.");
  const data = await response.json();

  const cards = [
    ["Total clients", data.total_clients],
    ["Open work orders", data.open_work_orders],
    ["Urgent work orders", data.urgent_work_orders],
    ["Completion rate", data.completion_rate + "%"]
  ];

  kpiGrid.innerHTML = cards.map(([label, value]) =>
    '<article class="kpi-card"><span>' +
    escapeHtml(String(label)) +
    '</span><strong>' +
    escapeHtml(String(value)) +
    "</strong></article>"
  ).join("");
}

async function loadOrders() {
  const params = new URLSearchParams();
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (priorityFilter.value) params.set("priority", priorityFilter.value);

  const response = await fetch("/api/work-orders?" + params.toString());
  if (!response.ok) throw new Error("Could not load work orders.");
  const orders = await response.json();

  ordersBody.innerHTML = orders.map((order) =>
    "<tr>" +
    '<td class="order-title">' + escapeHtml(order.title) + "</td>" +
    "<td>" + escapeHtml(order.client_name || "") + "</td>" +
    '<td><span class="badge ' + escapeHtml(order.priority) + '">' + escapeHtml(order.priority) + "</span></td>" +
    '<td><span class="badge ' + escapeHtml(order.status) + '">' + escapeHtml(order.status.replaceAll("_", " ")) + "</span></td>" +
    "<td>" + escapeHtml(order.assignee || "Unassigned") + "</td>" +
    "<td>" + escapeHtml(order.due_date || "—") + "</td>" +
    "</tr>"
  ).join("");

  if (!orders.length) {
    ordersBody.innerHTML = '<tr><td colspan="6">No work orders match the current filters.</td></tr>';
  }
}

async function loadClients() {
  const params = new URLSearchParams();
  if (clientSearch.value.trim()) params.set("search", clientSearch.value.trim());

  const response = await fetch("/api/clients?" + params.toString());
  if (!response.ok) throw new Error("Could not load clients.");
  const clients = await response.json();

  clientsList.innerHTML = clients.map((client) =>
    '<div class="client-card">' +
    "<strong>" + escapeHtml(client.company || client.name) + "</strong>" +
    "<span>" + escapeHtml(client.name) + " · " + escapeHtml(client.status) + "</span>" +
    "</div>"
  ).join("");

  if (!clients.length) {
    clientsList.innerHTML = '<div class="client-card"><span>No clients found.</span></div>';
  }
}

async function boot() {
  try {
    await Promise.all([loadDashboard(), loadOrders(), loadClients()]);
    statusEl.textContent = "Dashboard loaded successfully.";
  } catch (error) {
    statusEl.textContent = error.message;
    statusEl.classList.add("error");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();
