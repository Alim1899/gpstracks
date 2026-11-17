import styles from "./Button.module.css";

export function Button({
  variant = "primary", // primary | outline | link
  type = "button",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}