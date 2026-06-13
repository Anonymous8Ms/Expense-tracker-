import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  getTransactionById,
  getTransactions
} from "./crud.js";
import { getState, loadTheme, loadTransactions, saveTheme, setEditingId, setFilters } from "./state.js";
import {
  applyTheme,
  clearFormErrors,
  populateCategoryOptions,
  renderChart,
  renderForm,
  renderFormErrors,
  renderList,
  renderRecentTransactions,
  renderSummary,
  showToast,
  syncFilterControls,
  toggleCustomDateFields
} from "./render.js";
import { getTodayDate } from "./utils.js";

function getFormData(form) {
  const elements = form.elements;
  return {
    type: elements.namedItem("type").value,
    description: elements.namedItem("description").value,
    amount: elements.namedItem("amount").value,
    category: elements.namedItem("category").value,
    date: elements.namedItem("date").value
  };
}

function refreshUI() {
  const { filters } = getState();
  renderSummary();
  renderList(getTransactions(filters));
  renderRecentTransactions();
  renderChart();
  syncFilterControls(filters);
}

function resetToCreateMode() {
  setEditingId(null);
  renderForm("create");
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = getFormData(form);
  const { editingId } = getState();

  // One handler manages both create and edit so the form stays simple.
  const result = editingId
    ? editTransaction(editingId, formData)
    : addTransaction(formData);

  if (!result.isValid) {
    renderFormErrors(result.errors);
    showToast("Please fix the form errors.");
    return;
  }

  resetToCreateMode();
  refreshUI();
  showToast(editingId ? "Transaction updated." : "Transaction added.");
}

function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const card = event.target.closest("[data-id]");
  if (!card) {
    return;
  }

  const id = card.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const transaction = getTransactionById(id);
    if (!transaction) {
      showToast("Transaction no longer exists.");
      return;
    }

    setEditingId(id);
    renderForm("edit", transaction);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const shouldDelete = window.confirm("Delete this transaction?");
    if (!shouldDelete) {
      return;
    }

    const deleted = deleteTransaction(id);
    if (deleted) {
      if (getState().editingId === id) {
        resetToCreateMode();
      }
      refreshUI();
      showToast("Transaction deleted.");
    }
  }
}

function handleFiltersChange() {
  // Filters live in state so every render reads from one consistent source.
  setFilters({
    type: document.getElementById("filterType").value,
    category: document.getElementById("filterCategory").value,
    dateRange: document.getElementById("filterDateRange").value,
    customStart: document.getElementById("customDateStart").value,
    customEnd: document.getElementById("customDateEnd").value,
    sortBy: document.getElementById("sortBy").value
  });

  toggleCustomDateFields(getState().filters.dateRange === "custom");
  renderList(getTransactions(getState().filters));
}

function handleThemeToggle() {
  const nextTheme = getState().theme === "light" ? "dark" : "light";
  saveTheme(nextTheme);
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme} mode.`);
}

function bindEvents() {
  document.getElementById("transactionForm").addEventListener("submit", handleSubmit);
  document.getElementById("transactionList").addEventListener("click", handleListClick);
  document.getElementById("themeToggle").addEventListener("click", handleThemeToggle);
  document.getElementById("cancelEditBtn").addEventListener("click", resetToCreateMode);

  [
    "filterType",
    "filterCategory",
    "filterDateRange",
    "sortBy",
    "customDateStart",
    "customDateEnd"
  ].forEach((id) => {
    document.getElementById(id).addEventListener("change", handleFiltersChange);
  });

  document.querySelectorAll("#transactionForm input, #transactionForm select").forEach((field) => {
    field.addEventListener("input", clearFormErrors);
  });
}

function init() {
  loadTransactions();
  applyTheme(loadTheme());

  populateCategoryOptions(document.getElementById("category"));
  populateCategoryOptions(document.getElementById("filterCategory"), true);

  document.getElementById("date").value = getTodayDate();

  bindEvents();
  refreshUI();
  renderForm("create");
}

init();
