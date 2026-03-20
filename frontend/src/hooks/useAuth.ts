import { useEffect, useState } from "react";
import type { User } from "../types";
import { getUser } from "../utils/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
  }, []);

  return { user, setUser };
};