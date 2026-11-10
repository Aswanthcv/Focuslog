import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  loadUserData,
  saveUserData,
  validateImport,
} from "../storage/storage";

const AppContext = createContext(null);
const TYPES = new Set(["INCOME", "EXPENSE", "SAVING"]);

function validDate(date) {
  return !Number.isNaN(new Date(date).getTime());
}

function validateWalletName(name, wallets, walletId) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "Wallet name is required.";
  const duplicate = wallets.some(
    (wallet) => wallet.id !== walletId && wallet.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  return duplicate ? "A wallet with that name already exists." : null;
}

function validateTransaction(transaction, wallets) {
  if (!Number.isInteger(transaction.amount) || transaction.amount <= 0) {
    return "Transaction amount must be a positive integer.";
  }
  if (!wallets.some((wallet) => wallet.id === transaction.walletId)) {
    return "Please choose an existing wallet.";
  }
  if (!validDate(transaction.date)) return "Please enter a valid date.";
  if (!TYPES.has(transaction.type)) return "Please choose a valid transaction type.";
  return String(transaction.note ?? "").trim().length > 60
    ? "Note must be 60 characters or fewer."
    : null;
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => (user ? loadUserData(user.id) : { wallets: [], transactions: [] }));

  // Reload the current user's data when the signed-in user changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setData(user ? loadUserData(user.id) : { wallets: [], transactions: [] });
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function updateData(nextData) {
    setData(nextData);
    if (user) saveUserData(user.id, nextData);
  }

  function addWallet(name, initialBalancePaise) {
    const error = validateWalletName(name, data.wallets);
    if (error) return error;
    if (!Number.isInteger(initialBalancePaise) || initialBalancePaise < 0) {
      return "Initial balance must be a non-negative integer.";
    }
    const wallet = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      initialBalance: initialBalancePaise,
      createdAt: new Date().toISOString(),
    };
    updateData({ ...data, wallets: [...data.wallets, wallet] });
    return null;
  }

  function renameWallet(id, newName) {
    const error = validateWalletName(newName, data.wallets, id);
    if (error) return error;
    if (!data.wallets.some((wallet) => wallet.id === id)) return "Wallet not found.";
    const wallets = data.wallets.map((wallet) =>
      wallet.id === id ? { ...wallet, name: String(newName).trim() } : wallet
    );
    updateData({ ...data, wallets });
    return null;
  }

  function deleteWallet(id) {
    updateData({
      wallets: data.wallets.filter((wallet) => wallet.id !== id),
      transactions: data.transactions.filter((item) => item.walletId !== id),
    });
    return null;
  }

  function addTransaction(transaction) {
    const error = validateTransaction(transaction, data.wallets);
    if (error) return error;
    const nextTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      note: String(transaction.note ?? "").trim(),
    };
    updateData({ ...data, transactions: [...data.transactions, nextTransaction] });
    return null;
  }

  function updateTransaction(id, transaction) {
    const error = validateTransaction(transaction, data.wallets);
    if (error) return error;
    if (!data.transactions.some((item) => item.id === id)) return "Transaction not found.";
    const transactions = data.transactions.map((item) =>
      item.id === id ? { ...transaction, id, note: String(transaction.note ?? "").trim() } : item
    );
    updateData({ ...data, transactions });
    return null;
  }

  function deleteTransaction(id) {
    updateData({ ...data, transactions: data.transactions.filter((item) => item.id !== id) });
    return null;
  }

  function importData(obj) {
    const error = validateImport(obj);
    if (error) return error;
    updateData(obj);
    return null;
  }

  function clearAll() {
    updateData({ wallets: [], transactions: [] });
    return null;
  }

  const value = {
    wallets: data.wallets,
    transactions: data.transactions,
    addWallet,
    renameWallet,
    deleteWallet,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importData,
    clearAll,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// The provider and hook intentionally share this context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
