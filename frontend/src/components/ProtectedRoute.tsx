import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;