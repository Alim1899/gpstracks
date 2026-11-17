import { useId } from "react";
import styles from "./Input.module.css";

export function Input({ label, error, hint, rightSlot, className = "", ...props }) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div className={`${styles.control} ${error ? styles.hasError : ""}`}>
        <input
          id={id}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
        />
        {rightSlot}
      </div>

      {error ? (
        <p id={messageId} className={styles.error} role="alert">{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}