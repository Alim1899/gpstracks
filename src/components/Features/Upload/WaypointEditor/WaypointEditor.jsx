import { useTranslation } from "react-i18next";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import { missingNameLangs, waypointName } from "@/components/Utils/waypoints";
import styles from "./WaypointEditor.module.css";

/**
 * რედაქტირებისას წერტილების სია: ✎ (ან რიგზე დაჭერა) ხსნის წერტილის ფორმას რუკაზე, 🗑 შლის
 * langs: ბილიკის ენები — სახელი თუ რომელიმე ენაზე აკლია, რიგზე გაფრთხილება ჩანს
 */
export function WaypointEditor({ waypoints, langs, selected, onSelect, onDelete }) {
  const { t, i18n } = useTranslation();

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
          {waypoints.map((w, i) => {
            const missing = missingNameLangs(w, langs);
            const missingText = missing.length
              ? t("waypoints.missingLangs", { langs: missing.map((l) => t(`languages.${l}`)).join(", ") })
              : null;
            return (
              <li
                key={`${i}-${w.lat}-${w.lng}`}
                className={`${styles.item} ${i === selected ? styles.open : ""} ${missing.length ? styles.incomplete : ""}`}
              >
                <button type="button" className={styles.row} onClick={() => onSelect(i)}>
                  <WaypointPin type={w.type} size={26} />
                  <span className={styles.name}>
                    {waypointName(w, i18n.resolvedLanguage).text || t(`waypoints.types.${w.type}`)}
                  </span>
                  {missingText && (
                    <span className={styles.warning} role="img" aria-label={missingText} title={missingText}>
                      <TriangleAlert size={16} />
                    </span>
                  )}
                  {w.ele != null && (
                    <span className={styles.ele}>
                      {w.ele} {t("units.m")}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => onSelect(i)}
                  aria-label={t("waypoints.edit")}
                  title={t("waypoints.edit")}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.delete}`}
                  onClick={() => onDelete(i)}
                  aria-label={t("waypoints.delete")}
                  title={t("waypoints.delete")}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}