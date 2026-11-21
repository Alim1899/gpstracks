import { useTranslation } from "react-i18next";
import { Clock, Info, TriangleAlert } from "lucide-react";
import styles from "./TrailWarnings.module.css";

// გაფრთხილებები ბილიკის თავზე. ჩანს მხოლოდ საჭიროების შემთხვევაში.
export function TrailWarnings({ trail, isOwner }) {
  const { t } = useTranslation();

  const items = [
    isOwner && trail.status === "pending" && { key: "pending", Icon: Clock, variant: "info" },
    trail.occupied && { key: "occupied", Icon: TriangleAlert, variant: "danger" },
    trail.activity === "mountaineering" && { key: "mountaineering", Icon: Info, variant: "warning" },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className={styles.list}>
      {items.map(({ key, Icon, variant }) => (
        <p key={key} className={`${styles.item} ${styles[variant]}`} role={variant === "danger" ? "alert" : "status"}>
          <Icon size={20} className={styles.icon} />
          {t(`trailPage.warnings.${key}`)}
        </p>
      ))}
    </div>
  );
}