import { STORAGE_KEYS } from "./constants";
import type { User } from "../types";

const isValidUser = (value: unknown): value is User => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<User>;
  return (
    typeof candidate.id === "number" &&
    candidate.id > 0 &&
    typeof candidate.login === "string" &&
    typeof candidate.avatar_url === "string"
  );
};

export const saveAuth = (user: User, token?: string) => {
  if (!isValidUser(user)) {
    throw new Error("Invalid user payload");
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

  if (token && token.trim()) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
};

export const getUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;

    const parsed = JSON.parse(data) as unknown;
    return isValidUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};