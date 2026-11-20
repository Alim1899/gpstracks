import { ChevronDown } from "lucide-react";
import styles from "./Collapsible.module.css";

// ჩაკეცვადი ბლოკი: ბრაუზერის <details>, JavaScript-ის გარეშე
export function Collapsible({ title, hint, defaultOpen = false, children }) {
  return (
    <details className={styles.details} open={defaultOpen}>
      <summary className={styles.summary}>
        <span>
          <span className={styles.title}>{title}</span>
          {hint && <span className={styles.hint}>{hint}</span>}
        </span>
        <ChevronDown size={20} className={styles.icon} aria-hidden="true" />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}