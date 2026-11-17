import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/Context/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    // შესვლის შემდეგ იმავე გვერდზე დააბრუნებს
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}