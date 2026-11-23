import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import styles from "./WaypointEditor.module.css";

/**
 * რედაქტირებისას წერტილების სია: დაჭერა რუკაზე ხსნის წერტილის ფორმას, 🗑 შლის
 * სახელი და ტიპი იცვლება რუკაზე (popup), სია არ იშლება
 */
export function WaypointEditor({ waypoints, selected, onSelect, onDelete }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        {t("waypoints.title")}
        {waypoints.length > 0 && <span className={styles.count}>{waypoints.length}</span>}
      </h2>

      {waypoints.length === 0 ? (
        <p className={styles.empty}>{t("waypoints.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {waypoints.map((w, i) => (
            <li key={`${i}-${w.lat}-${w.lng}`} className={`${styles.item} ${i === selected ? styles.open : ""}`}>
              <button type="button" className={styles.row} onClick={() => onSelect(i)}>
                <WaypointPin type={w.type} size={26} />
                <span className={styles.name}>{w.name || t(`waypoints.types.${w.type}`)}</span>
                {w.ele != null && (
                  <span className={styles.ele}>
                    {w.ele} {t("units.m")}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={styles.delete}
                onClick={() => onDelete(i)}
                aria-label={t("waypoints.delete")}
                title={t("waypoints.delete")}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}