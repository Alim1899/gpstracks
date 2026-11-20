import { useId } from "react";
import styles from "../Input/Input.module.css";
import own from "./Textarea.module.css";

export function Textarea({ label, error, hint, maxLength, value = "", rows = 4, className = "", ...props }) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div className={`${styles.control} ${error ? styles.hasError : ""}`}>
        <textarea
          id={id}
          className={`${styles.input} ${own.textarea}`}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
        />
      </div>

      <div className={own.footer}>
        {error ? (
          <p id={messageId} className={styles.error} role="alert">{error}</p>
        ) : hint ? (
          <p id={messageId} className={styles.hint}>{hint}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <span className={own.counter}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}