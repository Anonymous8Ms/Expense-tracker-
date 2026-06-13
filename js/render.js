import { calculateTotals, getExpenseBreakdown, getRecentTransactions } from "./crud.js";
import { CATEGORIES, formatCurrency, getTodayDate } from "./utils.js";

let toastTimer = null;

export function populateCategoryOptions(selectElement, includeAll = false) {
  const options = includeAll ? ['<option value="all">All categories</option>'] : [];

  CATEGORIES.forEach((category) => {
    options.push(`<option value="${category}">${category}</option>`);
  });

  selectElement.innerHTML = options.join("");
}

export function renderSummary() {
  const totals = calculateTotals();
  document.getElementById("totalIncome").textContent = formatCurrency(totals.income);
  document.getElementById("totalExpense").textContent = formatCurrency(totals.expense);
  document.getElementById("netBalance").textContent = formatCurrency(totals.balance);
}

export function renderList(transactions) {
  const listElement = document.getElementById("transactionList");

  if (!transactions.length) {
    listElement.innerHTML = `
      <div class="et-list-empty">
        <p>No transactions yet. Add your first one above!</p>
      </div>
    `;
    return;
  }

  listElement.innerHTML = transactions.map((transaction) => `
    <article class="et-list-item" data-id="${transaction.id}">
      <div class="et-list-item-head">
        <div>
          <p class="et-badge">${transaction.category}</p>
          <h3>${transaction.description}</h3>
        </div>
        <p class="et-amount et-amount-${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}
        </p>
      </div>
      <div class="et-meta-row">
        <span>${transaction.date}</span>
        <span>${transaction.type}</span>
      </div>
      <div class="et-list-item-actions">
        <button class="et-list-action" data-action="edit" type="button">Edit</button>
        <button class="et-list-action" data-action="delete" type="button">Delete</button>
      </div>
    </article>
  `).join("");
}

export function renderRecentTransactions() {
  const container = document.getElementById("recentTransactions");
  const transactions = getRecentTransactions();

  if (!transactions.length) {
    container.innerHTML = `<div class="et-recent-empty">Recent transactions will appear here.</div>`;
    return;
  }

  container.innerHTML = transactions.map((transaction) => `
    <article class="et-recent-item">
      <div>
        <strong>${transaction.description}</strong>
        <p class="et-eyebrow">${transaction.category} • ${transaction.date}</p>
      </div>
      <strong class="et-amount et-amount-${transaction.type}">
        ${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}
      </strong>
    </article>
  `).join("");
}

export function renderChart() {
  const chartElement = document.getElementById("categoryChart");
  const breakdown = getExpenseBreakdown();

  if (!breakdown.length) {
    chartElement.innerHTML = `<div class="et-chart-empty">Add expense transactions to see the category chart.</div>`;
    return;
  }

  chartElement.innerHTML = breakdown.map((item) => `
    <div class="et-chart-row">
      <div class="et-chart-meta">
        <span>${item.category}</span>
        <span>${formatCurrency(item.amount)}</span>
      </div>
      <div class="et-chart-bar">
        <span style="width: ${item.percent.toFixed(2)}%"></span>
      </div>
    </div>
  `).join("");
}

export function renderForm(mode = "create", transaction = null) {
  const form = document.getElementById("transactionForm");
  const elements = form.elements;
  const title = document.getElementById("formTitle");
  const submitButton = document.getElementById("submitBtn");
  const cancelEditButton = document.getElementById("cancelEditBtn");

  clearFormErrors();

  if (!transaction) {
    form.reset();
    elements.namedItem("type").value = "income";
    elements.namedItem("date").value = getTodayDate();
    title.textContent = "Add Transaction";
    submitButton.textContent = "Add Transaction";
    cancelEditButton.classList.add("is-hidden");
    return;
  }

  elements.namedItem("type").value = transaction.type;
  elements.namedItem("description").value = transaction.description;
  elements.namedItem("amount").value = transaction.amount;
  elements.namedItem("category").value = transaction.category;
  elements.namedItem("date").value = transaction.date;
  title.textContent = mode === "edit" ? "Edit Transaction" : "Add Transaction";
  submitButton.textContent = mode === "edit" ? "Save Changes" : "Add Transaction";
  cancelEditButton.classList.toggle("is-hidden", mode !== "edit");
}

export function renderFormErrors(errors = {}) {
  clearFormErrors();
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = document.querySelector(`[data-error-for="${field}"]`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  });
}

export function clearFormErrors() {
  document.querySelectorAll(".et-error").forEach((element) => {
    element.textContent = "";
  });
}

export function syncFilterControls(filters) {
  document.getElementById("filterType").value = filters.type;
  document.getElementById("filterCategory").value = filters.category;
  document.getElementById("filterDateRange").value = filters.dateRange;
  document.getElementById("sortBy").value = filters.sortBy;
  document.getElementById("customDateStart").value = filters.customStart;
  document.getElementById("customDateEnd").value = filters.customEnd;
  toggleCustomDateFields(filters.dateRange === "custom");
}

export function toggleCustomDateFields(shouldShow) {
  document.getElementById("customDateFields").classList.toggle("is-hidden", !shouldShow);
}

export function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  document.getElementById("themeToggleLabel").textContent = theme === "light" ? "Dark mode" : "Light mode";
}

export function showToast(message) {
  const toastElement = document.getElementById("toast");
  toastElement.textContent = message;
  toastElement.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastElement.classList.remove("is-visible");
  }, 2400);
}
