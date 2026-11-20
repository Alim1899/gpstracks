import styles from "./SegmentedControl.module.css";

/**
 * რამდენიმე ღილაკი ერთ ჩარჩოში, ერთი აქტიური (მაგ. ენის არჩევა).
 * options: [{ value, label }]
 */
export function SegmentedControl({ options, value, onChange, ariaLabel, disabled = false }) {
  return (
    <div className={styles.switcher} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} ${option.value === value ? styles.active : ""}`}
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}