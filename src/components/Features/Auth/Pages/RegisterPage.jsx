import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { AuthCard } from "../AuthCard/AuthCard";
import { RegisterForm } from "../Register/RegisterForm";

export function RegisterPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <AuthCard title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <RegisterForm />
    </AuthCard>
  );
}