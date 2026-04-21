import { useState } from "react";
import type { User } from "../types";
import { getUser } from "../utils/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => getUser());

  return { user, setUser };
};