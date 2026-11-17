import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/Context/useAuth";
import { useForm } from "@/hooks/useForm";
import { createValidator, validateEmail, validatePassword } from "@/components/Utils/validators";
import { getAuthErrorMessage } from "@/components/Utils/firebaseErrors";
import { Alert, Button, Input, PasswordInput } from "@/components/UI/Index";
import styles from "./AuthForm.module.css";
import { GoogleButton } from "../GoogleButton/GoogleButton";

const validate = createValidator({
  email: validateEmail,
  password: validatePassword,
});

export function LoginForm({ onForgotPassword }) {
  const { loginWithEmail } = useAuth();
  const [formError, setFormError] = useState(null);

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

      <PasswordInput label="პაროლი" autoComplete="current-password" {...getFieldProps("password")} />

      <div className={styles.forgotRow}>
        <Button variant="link" onClick={onForgotPassword}>
          დაგავიწყდა პაროლი?
        </Button>
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>
        შესვლა
      </Button>

      <div className={styles.divider}>ან</div>

      <GoogleButton onError={setFormError} />

      <p className={styles.switch}>
        არ გაქვს ანგარიში? <Link to="/register">რეგისტრაცია</Link>
      </p>
    </form>
  );
}