import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { useForm } from "@/hooks/useForm";
import { createValidator, validateEmail, validatePassword } from "@/components/Utils/validators";
import { getAuthErrorKey } from "@/components/Utils/firebaseErrors";
import { Alert, Button, Input, PasswordInput } from "@/components/UI/Index";
import styles from "./AuthForm.module.css";
import { GoogleButton } from "../GoogleButton/GoogleButton";

const validate = createValidator({
  email: validateEmail,
  password: validatePassword,
});

export function LoginForm({ onForgotPassword }) {
  const { t } = useTranslation();
  const { loginWithEmail } = useAuth();
  const [formError, setFormError] = useState(null); // თარგმანის გასაღები

  const { getFieldProps, handleSubmit, isSubmitting } = useForm(
    { email: "", password: "" },
    validate
  );

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setFormError(getAuthErrorKey(err.code));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Alert variant="error">{formError && t(formError)}</Alert>

      <Input
        label={t("auth.email")}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        {...getFieldProps("email")}
      />

      <PasswordInput
        label={t("auth.password")}
        autoComplete="current-password"
        {...getFieldProps("password")}
      />

      <div className={styles.forgotRow}>
        <Button variant="link" onClick={onForgotPassword}>
          {t("auth.forgotPassword")}
        </Button>
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>
        {t("auth.submitLogin")}
      </Button>

      <div className={styles.divider}>{t("common.or")}</div>

      <GoogleButton onError={setFormError} />

      <p className={styles.switch}>
        {t("auth.noAccount")} <Link to="/register">{t("auth.submitRegister")}</Link>
      </p>
    </form>
  );
}