import { STORAGE_KEYS } from "./utils.js";

const state = {
  transactions: [],
  theme: "light",
  editingId: null,
  filters: {
    type: "all",
    category: "all",
    dateRange: "all",
    customStart: "",
    customEnd: "",
    sortBy: "date-desc"
  }
};

export function loadTransactions() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.transactions);
    state.transactions = storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    state.transactions = [];
  }
  return state.transactions;
}

export function saveTransactions(data) {
  state.transactions = data;
  try {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save transactions.", error);
  }
}

export function loadTheme() {
  state.theme = localStorage.getItem(STORAGE_KEYS.theme) || "light";
  return state.theme;
}

export function saveTheme(theme) {
  state.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (error) {
    console.error("Failed to save theme.", error);
  }
}

export function getState() {
  return state;
}

export function setEditingId(id) {
  state.editingId = id;
}

export function setFilters(nextFilters) {
  state.filters = {
    ...state.filters,
    ...nextFilters
  };
}
