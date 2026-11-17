import { useState } from "react";
import { useForm } from "@/hooks/useForm";
import { createValidator,validateEmail,validatePassword } from "@/components/Utils/validators";
import { getAuthErrorMessage } from "@/components/Utils/firebaseErrors";
import { Alert, Button,Input,PasswordInput } from "@/components/UI/Index";
import styles from "./AuthForm.module.css";
import { useAuth } from "@/Context/useAuth";
import { isInAppBrowser } from "@/components/Utils/browser";

const validate = createValidator({
  email: validateEmail,
  password: validatePassword,
});

export function LoginForm({ onForgotPassword }) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [formError, setFormError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { getFieldProps, handleSubmit, isSubmitting } = useForm(
    { email: "", password: "" },
    validate
  );

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setFormError(getAuthErrorMessage(err.code));
    }
  });

  async function onGoogleLogin() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setFormError(getAuthErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = isSubmitting || googleLoading;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Alert variant="error">{formError}</Alert>

      <Input
        label="ელ-ფოსტა"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        {...getFieldProps("email")}
      />

      <PasswordInput
        label="პაროლი"
        autoComplete="current-password"
        {...getFieldProps("password")}
      />

      <div className={styles.forgotRow}>
        <Button variant="link" onClick={onForgotPassword}>
          დაგავიწყდა პაროლი?
        </Button>
      </div>

      <Button type="submit" fullWidth loading={isSubmitting} disabled={busy}>
        შესვლა
      </Button>

      <div className={styles.divider}>ან</div>

      {isInAppBrowser() ? (
        <Alert variant="info">
          Google-ით შესასვლელად გახსენი გვერდი Chrome-ში ან Safari-ში.
        </Alert>
      ) : (
        <Button variant="outline" fullWidth loading={googleLoading} disabled={busy} onClick={onGoogleLogin}>
          Google-ით შესვლა
        </Button>
      )}
    </form>
  );
}