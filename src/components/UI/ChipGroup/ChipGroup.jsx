import { useId } from "react";
import styles from "./ChipGroup.module.css";

/**
 * ჩიპების ჯგუფი: ერთი არჩევანი (radio) ან რამდენიმე (checkbox).
 * options: [{ value, label, icon? }]
 * value: ერთი მნიშვნელობა ან მასივი (multiple)
 * onChange: იღებს ახალ მნიშვნელობას (ან მასივს)
 * allowDeselect: ერთი არჩევანისას არჩეულზე ხელახალი დაჭერა მოხსნის მას (არასავალდებულო ველებისთვის)
 */
export function ChipGroup({
  label,
  options,
  value,
  onChange,
  onBlur,
  multiple = false,
  allowDeselect = false,
  name,
  error,
  hint,
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const selected = multiple ? (value ?? []) : value;
  const isChecked = (v) => (multiple ? selected.includes(v) : selected === v);

  function toggle(v) {
    if (!multiple) return onChange(v);
    onChange(isChecked(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }

  // არჩეულ radio-ზე დაჭერისას onChange არ ხდება, ამიტომ მოხსნა click-ით
  function handleClick(v) {
    if (!multiple && allowDeselect && isChecked(v)) onChange("");
  }

  return (
    <fieldset className={styles.group} aria-describedby={error || hint ? messageId : undefined} onBlur={onBlur}>
      {label && <legend className={styles.legend}>{label}</legend>}

      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={`${styles.chip} ${isChecked(option.value) ? styles.checked : ""}`}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name ?? id}
              className={styles.input}
              checked={isChecked(option.value)}
              onChange={() => toggle(option.value)}
              onClick={() => handleClick(option.value)}
            />
            {option.icon}
            {option.label}
          </label>
        ))}
      </div>

      {error ? (
        <p id={messageId} className={styles.error} role="alert">{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </fieldset>
  );
}