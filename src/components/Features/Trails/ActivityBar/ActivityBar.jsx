import { useTranslation } from "react-i18next";
import { Activity, Car, Footprints, Mountain } from "lucide-react";
import { ACTIVITIES } from "@/components/Utils/trailOptions";
import styles from "./ActivityBar.module.css";

const ACTIVITY_ICONS = { hiking: Footprints, running: Activity, mountaineering: Mountain, offroad: Car };

/**
 * მთავარი ფილტრი: აქტივობა — დიდი ღილაკები რუკის თავზე
 * value: არჩეული აქტივობა ("" = ყველა, არცერთი მონიშნული); არჩეულზე ხელახლა დაჭერა მონიშვნას ხსნის
 * counts: { hiking: 3, ... } დანარჩენი ფილტრების გათვალისწინებით
 */
export function ActivityBar({ value, onChange, counts }) {
  const { t } = useTranslation();

  return (
    <div className={styles.bar} role="group" aria-label={t("trailForm.activity")}>
      {ACTIVITIES.map(({ id }) => {
        const Icon = ACTIVITY_ICONS[id];
        const active = value === id;
        const label = t(`activities.${id}`);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`${styles.button} ${active ? styles.active : ""}`}
            onClick={() => onChange(active ? "" : id)}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
            <span className={styles.count}>{counts[id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}