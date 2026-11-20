import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { useForm } from "@/hooks/useForm";
import {
  createValidator,
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/components/Utils/validators";
import { getAuthErrorKey } from "@/components/Utils/firebaseErrors";
import { Alert, Button, Input, PasswordInput } from "@/components/UI/Index";
import { GoogleButton } from "../GoogleButton/GoogleButton";
import styles from "../Login/AuthForm.module.css";

const validate = createValidator({
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export function RegisterForm() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [formError, setFormError] = useState(null); // თარგმანის გასაღები

  const { getFieldProps, handleSubmit, isSubmitting } = useForm(
    { name: "", email: "", password: "", confirmPassword: "" },
    validate
  );

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setFormError(getAuthErrorKey(err.code));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Alert variant="error">{formError && t(formError)}</Alert>

      <Input label={t("auth.name")} autoComplete="name" {...getFieldProps("name")} />

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
        autoComplete="new-password"
        hint={t("auth.passwordHint")}
        {...getFieldProps("password")}
      />

      <PasswordInput
        label={t("auth.confirmPassword")}
        autoComplete="new-password"
        {...getFieldProps("confirmPassword")}
      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        {t("auth.submitRegister")}
      </Button>

      <div className={styles.divider}>{t("common.or")}</div>

      <GoogleButton onError={setFormError} />

      <p className={styles.switch}>
        {t("auth.haveAccount")} <Link to="/login">{t("auth.submitLogin")}</Link>
      </p>
    </form>
  );
}