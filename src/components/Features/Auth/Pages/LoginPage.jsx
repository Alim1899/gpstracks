import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { LoginForm } from "../Login/LoginForm";
import { AuthCard } from "../AuthCard/AuthCard";
import { ForgotPasswordForm } from "../Login/ForgotPassword";
import { Loader } from "@/components/UI/Index";
const VIEWS = {
  login: { title: "auth.loginTitle", subtitle: "auth.loginSubtitle" },
  reset: { title: "auth.resetTitle", subtitle: "auth.resetSubtitle" },
};

export function LoginPage() {
  const { t } = useTranslation();
  const [view, setView] = useState("login");
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader/>;
  if (user) return <Navigate to={location.state?.from ?? "/"} replace />;

  return (
    <AuthCard title={t(VIEWS[view].title)} subtitle={t(VIEWS[view].subtitle)}>
      {view === "login" ? (
        <LoginForm onForgotPassword={() => setView("reset")} />
      ) : (
        <ForgotPasswordForm onBack={() => setView("login")} />
      )}
    </AuthCard>
  );
}