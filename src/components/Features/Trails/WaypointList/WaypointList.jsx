import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { Button } from "@/components/UI/Index";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import styles from "./WaypointList.module.css";
import { waypointName } from "@/components/Utils/waypoints";
// ბილიკის გვერდზე: წერტილების სია; დაჭერისას რუკაზე მოინიშნება
// onEdit: მხოლოდ ავტორს — „რედაქტირება“ ღილაკი (ცარიელი სიის დროსაც ჩანს)
export function WaypointList({ waypoints, selected, onSelect, onEdit }) {
  const { t, i18n } = useTranslation();
  if (!waypoints.length && !onEdit) return null;

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("waypoints.title")}</h2>
        {onEdit && (
          <Button variant="link" onClick={onEdit}>
            <Pencil size={16} />
            {t("waypoints.edit")}
          </Button>
        )}
      </header>
      {!waypoints.length && (
        <p className={styles.empty}>{t("waypoints.emptyOwner")}</p>
      )}
      <ul className={styles.list}>
        {waypoints.map((w, i) => (
          <li key={`${i}-${w.lat}-${w.lng}`}>
            <button
              type="button"
              className={`${styles.row} ${i === selected ? styles.selected : ""}`}
              onClick={() => onSelect(i === selected ? null : i)}
              aria-pressed={i === selected}
            >
              <WaypointPin type={w.type} size={28} />
              <span className={styles.text}>
                <span className={styles.name}>
                  {waypointName(w, i18n.resolvedLanguage).text ||
                    t(`waypoints.types.${w.type}`)}
                </span>
                <span className={styles.meta}>
                  {t(`waypoints.types.${w.type}`)}
                  {w.ele != null && ` · ${w.ele} ${t("units.m")}`}
                </span>
                {w.desc && <span className={styles.desc}>{w.desc}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
