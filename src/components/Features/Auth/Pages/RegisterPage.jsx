import { Navigate } from "react-router";
import { useAuth } from "@/Context/useAuth";
import { AuthCard } from "../AuthCard/AuthCard";
import { RegisterForm } from "../Register/RegisterForm";
export function RegisterPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <AuthCard title="რეგისტრაცია" subtitle="შექმენი ანგარიში და გააზიარე შენი ტრეკები">
      <RegisterForm />
    </AuthCard>
  );
}