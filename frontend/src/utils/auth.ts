import { STORAGE_KEYS } from "./constants";
import type { User } from "../types";

export const saveAuth = (user: User, token?: string) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};