import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "@/hooks/useForm";
import { createValidator, validateEmail } from "@/components/Utils/validators";
import { getAuthErrorKey } from "@/components/Utils/firebaseErrors";
import { Alert, Button, Input } from "@/components/UI/Index";
import styles from "./AuthForm.module.css";
import { useAuth } from "@/Context/useAuth";

const validate = createValidator({ email: validateEmail });

export function ForgotPasswordForm({ onBack }) {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [status, setStatus] = useState(null); // { variant, key }

  const { getFieldProps, handleSubmit, isSubmitting } = useForm({ email: "" }, validate);

  const onSubmit = handleSubmit(async ({ email }) => {
    setStatus(null);
    try {
      await resetPassword(email.trim());
      setStatus({ variant: "success", key: "auth.resetSent" });
    } catch (err) {
      setStatus({ variant: "error", key: getAuthErrorKey(err.code) });
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {status?.key && <Alert variant={status.variant}>{t(status.key)}</Alert>}

      <Input
        label={t("auth.email")}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        autoFocus
        {...getFieldProps("email")}
      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        {t("auth.sendResetLink")}
      </Button>

      <div className={styles.centered}>
        <Button variant="link" onClick={onBack}>
          {t("auth.backToLogin")}
        </Button>
      </div>
    </form>
  );
}