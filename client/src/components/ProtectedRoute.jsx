import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminAuth");
  const isAdmin = !!adminToken && adminToken !== "true";

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
