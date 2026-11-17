import { useState } from "react";
import { LoginForm } from "../Login/LoginForm";
import { AuthCard } from "../AuthCard/AuthCard";
import { ForgotPasswordForm } from "../Login/ForgotPassword";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/Context/useAuth";const VIEWS = {
  login: { title: "შესვლა", subtitle: "შედი შენს ანგარიშზე" },
  reset: { title: "პაროლის აღდგენა", subtitle: "გამოგიგზავნით აღდგენის ბმულს" },
};

export function LoginPage() {
  const [view, setView] = useState("login");
const { user, loading } = useAuth();
const location = useLocation();

if (loading) return null;
if (user) return <Navigate to={location.state?.from ?? "/"} replace />;
  return (
    <AuthCard {...VIEWS[view]}>
      {view === "login" ? (
        <LoginForm onForgotPassword={() => setView("reset")} />
      ) : (
        <ForgotPasswordForm onBack={() => setView("login")} />
      )}
    </AuthCard>
  );
}