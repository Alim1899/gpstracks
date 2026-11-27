import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateSettings } from "@/components/Services/userService";
import styles from "./UserMenu.module.css";

const DEFAULTS = { units: "metric", basemap: "topo", theme: "light" };

const GROUPS = [
  { key: "units", options: ["metric", "imperial"] },
  { key: "basemap", options: ["topo", "satellite", "osm"] },
  { key: "theme", options: ["light", "dark"] },
];

export default function InterfacePanel({ uid, settings, onChange }) {
  const { t } = useTranslation();
  const current = { ...DEFAULTS, ...settings };
  const [saving, setSaving] = useState(false);

  async function handleChange(key, value) {
    if (current[key] === value) return;
    const next = { ...current, [key]: value };

    onChange(next);
    setSaving(true);
    try {
      await updateSettings(uid, next);
    } catch (e) {
      console.error(e);
      onChange(current);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.panel}>
      {GROUPS.map(({ key, options }) => (
        <div key={key} className={styles.group}>
          <p className={styles.groupLabel}>{t(`userMenu.settings.${key}`)}</p>
          <div className={styles.segmented}>
            {options.map((value) => (
              <button
                key={value}
                type="button"
                className={current[key] === value ? styles.selected : ""}
                onClick={() => handleChange(key, value)}
                disabled={saving}
              >
                {t(`userMenu.settings.${value}`)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}