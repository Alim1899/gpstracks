import { Link } from "react-router";
import { MapPinOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <MapPinOff size={56} strokeWidth={1.5} className={styles.icon} />
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t("notFound.title")}</h1>
      <p className={styles.text}>{t("notFound.text")}</p>
      <Link to="/" className={styles.link}>
        {t("notFound.back")}
      </Link>
    </div>
  );
}