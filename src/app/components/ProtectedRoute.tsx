import { Navigate } from "react-router";
import { isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component - redirects to admin login if not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
