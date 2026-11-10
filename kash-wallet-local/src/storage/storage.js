const USERS_KEY = "kashwallet:users";
const SESSION_KEY = "kashwallet:session";
const LEGACY_KEY = "kashwallet:v1";

const emptyData = () => ({ wallets: [], transactions: [] });

function readJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function loadUsers() {
  const users = readJson(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession() {
  const session = readJson(SESSION_KEY, null);
  return session && typeof session.userId === "string" ? session : null;
}

export function saveSession(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadUserData(userId) {
  const data = readJson(`kashwallet:data:${userId}`, emptyData());
  return validateImport(data) === null ? data : emptyData();
}

export function saveUserData(userId, data) {
  localStorage.setItem(`kashwallet:data:${userId}`, JSON.stringify(data));
}

export function deleteUserData(userId) {
  localStorage.removeItem(`kashwallet:data:${userId}`);
}

// Used only for the one-time first-user migration.
export function loadLegacyData() {
  const data = readJson(LEGACY_KEY, null);
  if (!data || typeof data !== "object") return null;
  return Array.isArray(data.wallets) && Array.isArray(data.transactions)
    ? { wallets: data.wallets, transactions: data.transactions }
    : null;
}

export function exportJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kash-wallet-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function validateImport(obj) {
  if (!obj || typeof obj !== "object") {
    return "Import data must be an object.";
  }
  if (!Array.isArray(obj.wallets) || !Array.isArray(obj.transactions)) {
    return "Wallets and transactions must be arrays.";
  }

  const walletIds = new Set();
  for (const wallet of obj.wallets) {
    if (!wallet || typeof wallet !== "object" || !wallet.id || !wallet.name) {
      return "Each wallet needs an id and name.";
    }
    if (!Number.isInteger(wallet.initialBalance) || wallet.initialBalance < 0) {
      return "Each wallet needs a non-negative integer initial balance.";
    }
    if (walletIds.has(wallet.id)) return "Wallet ids must be unique.";
    walletIds.add(wallet.id);
  }

  const types = new Set(["INCOME", "EXPENSE", "SAVING"]);
  for (const transaction of obj.transactions) {
    if (!transaction || typeof transaction !== "object") {
      return "Each transaction must be an object.";
    }
    if (!types.has(transaction.type)) return "Transactions must use a valid type.";
    if (!Number.isInteger(transaction.amount) || transaction.amount <= 0) {
      return "Transaction amounts must be positive integers.";
    }
    if (Number.isNaN(new Date(transaction.date).getTime())) {
      return "Each transaction needs a valid date.";
    }
    if (!walletIds.has(transaction.walletId)) {
      return "Each transaction must belong to an existing wallet.";
    }
  }
  return null;
}
