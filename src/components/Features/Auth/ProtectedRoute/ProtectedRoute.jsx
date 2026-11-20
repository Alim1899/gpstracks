import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/Context/useAuth";
import { Loader } from "@/components/UI/Index";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader/>;

  if (!user) {
    // შესვლის შემდეგ იმავე გვერდზე დააბრუნებს
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}