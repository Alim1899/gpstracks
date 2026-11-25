import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/Context/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Loader } from "@/components/UI/Index";
import { NotFoundPage } from "@/components/Features/Common/Pages/NotFoundPage";

// მხოლოდ ადმინისთვის; სხვა მომხმარებელი 404-ს ხედავს (გვერდის არსებობა არ ჩანს)
export function AdminRoute() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <NotFoundPage />;
  return <Outlet />;
}