import { useState } from "react";
import { useForm } from "@/hooks/useForm";
import { createValidator, validateEmail } from "@/components/Utils/validators";
import { getAuthErrorMessage } from "@/components/Utils/firebaseErrors";
import { Alert, Button, Input } from "@/components/UI/Index";
import styles from "./AuthForm.module.css";
import { useAuth } from "@/Context/useAuth";

const validate = createValidator({ email: validateEmail });

export function ForgotPasswordForm({ onBack }) {
  const { resetPassword } = useAuth();
  const [status, setStatus] = useState(null); // { variant, message }

  const { getFieldProps, handleSubmit, isSubmitting } = useForm(
    { email: "" },
    validate,
  );

  const onSubmit = handleSubmit(async ({ email }) => {
    setStatus(null);
    try {
      await resetPassword(email.trim());
      setStatus({
        variant: "success",
        message: "თუ ეს ელ-ფოსტა რეგისტრირებულია, აღდგენის ბმულს მალე მიიღებ.",
      });
    } catch (err) {
      setStatus({ variant: "error", message: getAuthErrorMessage(err.code) });
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {status && <Alert variant={status.variant}>{status.message}</Alert>}

      <Input
        label="ელ-ფოსტა"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        autoFocus
        {...getFieldProps("email")}
      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        ბმულის გაგზავნა
      </Button>

      <div className={styles.centered}>
        <Button variant="link" onClick={onBack}>
          ← შესვლაზე დაბრუნება
        </Button>
      </div>
    </form>
  );
}
