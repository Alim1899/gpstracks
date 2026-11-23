import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2, X } from "lucide-react";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import { WAYPOINT_NAME_MAX, WAYPOINT_TYPES } from "@/components/Utils/waypoints";
import styles from "./WaypointForm.module.css";

/**
 * წერტილის სახელი და ტიპი — პირდაპირ რუკაზე, წერტილის popup-ში
 * isNew: ახალი წერტილი (გაუქმება = წაშლა)
 */
export function WaypointForm({ waypoint, isNew, onChange, onConfirm, onDelete }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  // preventScroll: ფოკუსმა გვერდი არ ჩამოასქროლოს
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function submit(e) {
    e.preventDefault();
    onConfirm();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        ref={inputRef}
        className={styles.input}
        value={waypoint.name}
        placeholder={t("waypoints.namePlaceholder")}
        maxLength={WAYPOINT_NAME_MAX}
        aria-label={t("waypoints.name")}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      <div className={styles.types} role="radiogroup" aria-label={t("waypoints.type")}>
        {WAYPOINT_TYPES.map(({ id }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={waypoint.type === id}
            title={t(`waypoints.types.${id}`)}
            className={`${styles.type} ${waypoint.type === id ? styles.active : ""}`}
            onClick={() => onChange({ type: id })}
          >
            <WaypointPin type={id} size={26} />
          </button>
        ))}
      </div>

      {/* div და არა p: Leaflet popup-ში p-ს დიდი დაშორებები აქვს */}
      <div className={styles.meta}>
        {t(`waypoints.types.${waypoint.type}`)}
        {waypoint.ele != null && ` · ${waypoint.ele} ${t("units.m")}`}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onDelete}>
          {isNew ? <X size={16} /> : <Trash2 size={16} />}
          {isNew ? t("waypoints.cancel") : t("waypoints.delete")}
        </button>
        <button type="submit" className={styles.primary}>
          <Check size={16} />
          {t("waypoints.done")}
        </button>
      </div>
    </form>
  );
}