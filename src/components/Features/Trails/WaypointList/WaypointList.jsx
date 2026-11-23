import { useTranslation } from "react-i18next";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import styles from "./WaypointList.module.css";

// ბილიკის გვერდზე: წერტილების სია; დაჭერისას რუკაზე მოინიშნება
export function WaypointList({ waypoints, selected, onSelect }) {
  const { t } = useTranslation();
  if (!waypoints.length) return null;

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{t("waypoints.title")}</h2>
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
                <span className={styles.name}>{w.name || t(`waypoints.types.${w.type}`)}</span>
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