import { formatDuration } from "@/components/Utils/trackParser";
import styles from "./TrackStats.module.css";

export function TrackStats({ stats }) {
  const items = [
    { label: "მანძილი", value: `${stats.distanceKm.toFixed(1)} კმ` },
    { label: "აღმართი", value: `${stats.gain} მ` },
    { label: "დაღმართი", value: `${stats.loss} მ` },
    { label: "მაქს. სიმაღლე", value: stats.maxEle != null ? `${stats.maxEle} მ` : "—" },
    { label: "სავარაუდო დრო", value: formatDuration(stats.durationHours) },
  ];

  return (
    <dl className={styles.grid}>
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}