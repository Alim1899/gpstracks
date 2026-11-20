import { useTranslation } from "react-i18next";
import styles from "./Loader.module.css";

// fullPage: მთელი ეკრანის ცენტრში (გვერდის ჩატვირთვა), სხვა შემთხვევაში ბლოკის ცენტრში
export function Loader({ fullPage = false }) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.wrapper} ${fullPage ? styles.fullPage : ""}`} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>{t("common.loading")}</span>
    </div>
  );
}