import { useState } from "react";
import { LoginForm } from "../Login/LoginForm";
import { AuthCard } from "../AuthCard/AuthCard";
import { ForgotPasswordForm } from "../Login/ForgotPassword";

const VIEWS = {
  login: { title: "შესვლა", subtitle: "შედი შენს ანგარიშზე" },
  reset: { title: "პაროლის აღდგენა", subtitle: "გამოგიგზავნით აღდგენის ბმულს" },
};

export function LoginPage() {
  const [view, setView] = useState("login");

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