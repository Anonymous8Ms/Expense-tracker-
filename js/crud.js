import { getState, saveTransactions } from "./state.js";
import {
  generateId,
  getDateRangeValues,
  normalizeTransaction,
  validateTransaction
} from "./utils.js";

export function addTransaction(data) {
  const validation = validateTransaction(data);
  if (!validation.isValid) {
    return validation;
  }

  const nextTransaction = {
    id: generateId(),
    ...normalizeTransaction(data)
  };

  const currentTransactions = getState().transactions;
  saveTransactions([nextTransaction, ...currentTransactions]);

  return {
    isValid: true,
    transaction: nextTransaction
  };
}

export function editTransaction(id, newData) {
  const validation = validateTransaction(newData);
  if (!validation.isValid) {
    return validation;
  }

  const currentTransactions = getState().transactions;
  const targetIndex = currentTransactions.findIndex((transaction) => transaction.id === id);

  if (targetIndex === -1) {
    return {
      isValid: false,
      errors: {
        form: "Transaction not found."
      }
    };
  }

  const updatedTransactions = [...currentTransactions];
  updatedTransactions[targetIndex] = {
    ...updatedTransactions[targetIndex],
    ...normalizeTransaction(newData)
  };

  saveTransactions(updatedTransactions);

  return {
    isValid: true,
    transaction: updatedTransactions[targetIndex]
  };
}

export function deleteTransaction(id) {
  const currentTransactions = getState().transactions;
  const updatedTransactions = currentTransactions.filter((transaction) => transaction.id !== id);

  if (updatedTransactions.length === currentTransactions.length) {
    return false;
  }

  saveTransactions(updatedTransactions);
  return true;
}

export function getTransactionById(id) {
  return getState().transactions.find((transaction) => transaction.id === id) || null;
}

export function getTransactions(filters) {
  const { transactions } = getState();
  const { type, category, dateRange, customStart, customEnd, sortBy } = filters;
  const range = getDateRangeValues(dateRange, customStart, customEnd);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = type === "all" ? true : transaction.type === type;
    const matchesCategory = category === "all" ? true : transaction.category === category;

    let matchesDate = true;
    if (range.start && range.end) {
      const transactionDate = new Date(transaction.date);
      const start = new Date(range.start);
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      matchesDate = transactionDate >= start && transactionDate <= end;
    }

    return matchesType && matchesCategory && matchesDate;
  });

  return filteredTransactions.sort((first, second) => {
    if (sortBy === "date-asc") {
      return new Date(first.date) - new Date(second.date);
    }

    if (sortBy === "amount-desc") {
      return second.amount - first.amount;
    }

    if (sortBy === "amount-asc") {
      return first.amount - second.amount;
    }

    return new Date(second.date) - new Date(first.date);
  });
}

export function calculateTotals() {
  return getState().transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        totals.income += transaction.amount;
      } else {
        totals.expense += transaction.amount;
      }

      totals.balance = totals.income - totals.expense;
      return totals;
    },
    {
      income: 0,
      expense: 0,
      balance: 0
    }
  );
}

export function getRecentTransactions(limit = 5) {
  return [...getState().transactions]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, limit);
}

export function getExpenseBreakdown() {
  const expenses = getState().transactions.filter((transaction) => transaction.type === "expense");
  const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);

  return expenses.reduce((groups, transaction) => {
    const existingGroup = groups.find((item) => item.category === transaction.category);

    if (existingGroup) {
      existingGroup.amount += transaction.amount;
    } else {
      groups.push({
        category: transaction.category,
        amount: transaction.amount
      });
    }

    return groups;
  }, []).map((item) => ({
    ...item,
    percent: totalExpense ? (item.amount / totalExpense) * 100 : 0
  })).sort((first, second) => second.amount - first.amount);
}
