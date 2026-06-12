export const STORAGE_KEYS = {
  transactions: "expense_tracker_data",
  theme: "expense_tracker_theme"
};

export const CATEGORIES = [
  "Food",
  "Rent",
  "Salary",
  "Freelance",
  "Utilities",
  "Entertainment",
  "Transport",
  "Other"
];

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(amount) || 0);
}

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function validateTransaction(data) {
  const errors = {};
  const trimmedDescription = String(data.description || "").trim();
  const amount = Number(data.amount);

  if (!trimmedDescription) {
    errors.description = "Description is required.";
  }

  if (trimmedDescription.length > 100) {
    errors.description = "Description must be 100 characters or less.";
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }

  if (!CATEGORIES.includes(data.category)) {
    errors.category = "Choose a valid category.";
  }

  if (!data.date) {
    errors.date = "Date is required.";
  }

  if (data.type !== "income" && data.type !== "expense") {
    errors.form = "Choose income or expense.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function normalizeTransaction(data) {
  return {
    type: data.type,
    amount: Number(Number(data.amount).toFixed(2)),
    description: String(data.description).trim(),
    category: data.category,
    date: data.date
  };
}

export function getDateRangeValues(range, customStart, customEnd) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let start = null;
  let end = null;

  if (range === "last7") {
    start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    end = today;
  }

  if (range === "last30") {
    start = new Date(startOfToday);
    start.setDate(start.getDate() - 29);
    end = today;
  }

  if (range === "thisMonth") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = today;
  }

  if (range === "custom" && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
  }

  return { start, end };
}
