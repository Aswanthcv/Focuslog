import { createContext, useContext, useState } from "react";
import {
  clearSession,
  deleteUserData,
  loadLegacyData,
  loadSession,
  loadUsers,
  saveSession,
  saveUserData,
  saveUsers,
} from "../storage/storage";
import { generateSalt, hashPassword } from "../utils/auth";

const AuthContext = createContext(null);
const usernamePattern = /^[a-zA-Z0-9_]+$/;

function findUser(users, username) {
  const normalized = String(username ?? "").trim().toLowerCase();
  return users.find((item) => item.username === normalized);
}

function validatePassword(password, confirmPassword) {
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must be at least 8 characters and include a letter and a number.";
  }
  return password !== confirmPassword ? "Passwords do not match." : null;
}

function currentUser() {
  const session = loadSession();
  if (!session) return null;
  const user = loadUsers().find((item) => item.id === session.userId) || null;
  if (!user) clearSession();
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(currentUser);
  const [failures, setFailures] = useState({});

  async function register(name, username, password, confirmPassword) {
    const trimmedName = String(name ?? "").trim();
    const normalizedUsername = String(username ?? "").trim().toLowerCase();
    if (!trimmedName) return "Name is required.";
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20 || !usernamePattern.test(normalizedUsername)) {
      return "Username must be 3 to 20 characters using letters, numbers, or underscores.";
    }
    const users = loadUsers();
    if (findUser(users, normalizedUsername)) return "That username is already taken.";
    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) return passwordError;

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser = {
      id: crypto.randomUUID(),
      name: trimmedName,
      username: normalizedUsername,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const oldData = users.length === 0 ? loadLegacyData() : null;
    saveUserData(newUser.id, oldData || { wallets: [], transactions: [] });
    saveSession(newUser.id);
    setUser(newUser);
    return null;
  }

  async function login(username, password) {
    const normalizedUsername = String(username ?? "").trim().toLowerCase();
    const attempt = failures[normalizedUsername];
    if (attempt?.blockedUntil > Date.now()) {
      const seconds = Math.ceil((attempt.blockedUntil - Date.now()) / 1000);
      return `Too many attempts. Try again in ${seconds} seconds.`;
    }

    const foundUser = findUser(loadUsers(), normalizedUsername);
    const valid = foundUser && (await hashPassword(password, foundUser.salt)) === foundUser.passwordHash;
    if (!valid) {
      const count = (attempt?.blockedUntil && attempt.blockedUntil <= Date.now() ? 0 : attempt?.count || 0) + 1;
      const blockedUntil = count >= 5 ? Date.now() + 30000 : 0;
      setFailures({ ...failures, [normalizedUsername]: { count, blockedUntil } });
      if (blockedUntil) return "Too many attempts. Try again in 30 seconds.";
      return "Invalid username or password.";
    }

    setFailures({ ...failures, [normalizedUsername]: { count: 0, blockedUntil: 0 } });
    saveSession(foundUser.id);
    setUser(foundUser);
    return null;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  async function deleteAccount(password) {
    if (!user) return "No account is currently signed in.";
    if ((await hashPassword(password, user.salt)) !== user.passwordHash) {
      return "Incorrect password.";
    }
    saveUsers(loadUsers().filter((item) => item.id !== user.id));
    deleteUserData(user.id);
    clearSession();
    setUser(null);
    return null;
  }

  const value = { user, register, login, logout, deleteAccount };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and hook intentionally share this context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
