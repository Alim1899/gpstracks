import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`${styles.option} ${code === current ? styles.active : ""}`}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={code === current}
        >
          {label}
        </button>
      ))}
    </div>
  );
}