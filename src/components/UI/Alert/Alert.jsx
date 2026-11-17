import styles from "./Alert.module.css";

export function Alert({ variant = "error", children }) {
  if (!children) return null;
  return (
    <p className={`${styles.alert} ${styles[variant]}`} role={variant === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}