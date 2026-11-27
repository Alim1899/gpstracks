import { useTranslation } from "react-i18next";
import styles from "./AuthorName.module.css";

export default function AuthorName({ trail }) {
  const { t } = useTranslation();

  if (trail.authorDeleted) {
    return <span className={styles.deleted}>{t("author.deletedProfile")}</span>;
  }
  return <span className={styles.name}>{trail.authorName}</span>;
}