import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/Context/useAuth";
import { useForm } from "@/hooks/useForm";
import {
  createValidator,
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/components/Utils/validators";
import { getAuthErrorMessage } from "@/components/Utils/firebaseErrors";
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
  const { register } = useAuth();
  const [formError, setFormError] = useState(null);

  const { getFieldProps, handleSubmit, isSubmitting } = useForm(
    { name: "", email: "", password: "", confirmPassword: "" },
    validate
  );

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setFormError(getAuthErrorMessage(err.code));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Alert variant="error">{formError}</Alert>

      <Input label="სახელი" autoComplete="name" {...getFieldProps("name")} />

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
        autoComplete="new-password"
        hint="მინიმუმ 6 სიმბოლო, ასო და ციფრი"
        {...getFieldProps("password")}
      />

      <PasswordInput
        label="გაიმეორე პაროლი"
        autoComplete="new-password"
        {...getFieldProps("confirmPassword")}
      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        რეგისტრაცია
      </Button>

      <div className={styles.divider}>ან</div>

      <GoogleButton onError={setFormError} />

      <p className={styles.switch}>
        უკვე გაქვს ანგარიში? <Link to="/login">შესვლა</Link>
      </p>
    </form>
  );
}