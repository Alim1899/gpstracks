import styles from "./Checkbox.module.css";

export function Checkbox({ label, checked, onChange, ...props }) {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
      />
      {label}
    </label>
  );
}