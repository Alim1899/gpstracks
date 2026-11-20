import { useTranslation } from "react-i18next";
import { formatDuration } from "@/components/Utils/trackParser";
import styles from "./TrackStats.module.css";

export function TrackStats({ stats }) {
  const { t } = useTranslation();
  const km = t("units.km");
  const m = t("units.m");

  const items = [
    { label: t("stats.distance"), value: `${stats.distanceKm.toFixed(1)} ${km}` },
    { label: t("stats.gain"), value: `${stats.gain} ${m}` },
    { label: t("stats.loss"), value: `${stats.loss} ${m}` },
    { label: t("stats.maxEle"), value: stats.maxEle != null ? `${stats.maxEle} ${m}` : "—" },
    { label: t("stats.estimated"), value: formatDuration(stats.durationHours, t) },
    stats.recorded && {
      label: t("stats.authorTime"),
      value: formatDuration(stats.recorded.totalHours, t),
      title: t("stats.movingTime", { time: formatDuration(stats.recorded.movingHours, t) }),
    },
  ].filter(Boolean);

  return (
    <dl className={styles.grid}>
      {items.map(({ label, value, title }) => (
        <div key={label} className={styles.item} title={title}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}